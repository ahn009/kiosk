import crypto from "crypto";

// ---- Signing key (per-org). In production this is Ed25519; here HMAC-SHA256.
// Loaded from env, fallback to a stable dev key.
const ORG_SIGNING_KEY =
  process.env.ORG_SIGNING_KEY ||
  "acme-kiosk-master-signing-key-dev-do-not-use-in-prod-0123456789";

const KEY_ID = process.env.KEY_ID || "k1";

export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function randomNonce(bytes = 8): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/** Sign a message with HMAC-SHA256, return hex. */
function hmacSign(message: string): string {
  return crypto
    .createHmac("sha256", ORG_SIGNING_KEY)
    .update(message)
    .digest("hex");
}

/**
 * Build a QR token: v2.<org_code>.<key_id>.<nonce>.<exp_epoch>.<signature>
 * The signature covers v2.org_code.key_id.nonce.exp
 */
export function buildToken(opts: {
  orgCode: string;
  expEpoch: number; // seconds
  nonce?: string;
}): { token: string; nonce: string; keyId: string; exp: number } {
  const nonce = opts.nonce ?? randomNonce();
  const message = `v2.${opts.orgCode}.${KEY_ID}.${nonce}.${opts.expEpoch}`;
  const sig = hmacSign(message);
  const token = `${message}.${sig}`;
  return { token, nonce, keyId: KEY_ID, exp: opts.expEpoch };
}

export type TokenVerifyResult =
  | {
      ok: true;
      orgCode: string;
      keyId: string;
      nonce: string;
      exp: number;
      tokenHash: string;
    }
  | { ok: false; reason: "invalid_token" | "expired" | "bad_signature" };

/** Verify a QR token's signature & expiry. Does NOT check revocation. */
export function verifyToken(token: string): TokenVerifyResult {
  const parts = token.trim().split(".");
  if (parts.length !== 6 || parts[0] !== "v2") {
    return { ok: false, reason: "invalid_token" };
  }
  const [, orgCode, keyId, nonce, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= 0) {
    return { ok: false, reason: "invalid_token" };
  }
  const message = `v2.${orgCode}.${keyId}.${nonce}.${expStr}`;
  const expected = hmacSign(message);
  if (!safeEqual(expected, sig)) {
    return { ok: false, reason: "bad_signature" };
  }
  if (Math.floor(Date.now() / 1000) > exp) {
    return { ok: false, reason: "expired" };
  }
  return { ok: true, orgCode, keyId, nonce, exp, tokenHash: sha256(token) };
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Hash a PIN/password with bcrypt-like work factor using scrypt (built-in). */
export function hashSecret(secret: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .scryptSync(secret, salt, 32)
    .toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifySecret(secret: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = parts[1];
  const expected = parts[2];
  const hash = crypto.scryptSync(secret, salt, 32).toString("hex");
  return safeEqual(hash, expected);
}

/** Generate a 6-digit supervisor PIN. */
export function generatePin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ---- Face embedding helpers (simulated) ----
// In production: InsightFace ArcFace produces a 512-d vector. Here we
// deterministically generate a stable 512-d vector from an employee seed so
// the demo "match" logic is realistic and reproducible.
export function generateEmbedding(seed: string): number[] {
  const vec: number[] = [];
  const h = crypto.createHash("sha256").update(seed).digest();
  let counter = 0;
  while (vec.length < 512) {
    const buf = crypto
      .createHash("sha256")
      .update(seed + ":" + counter)
      .digest();
    for (let i = 0; i < buf.length && vec.length < 512; i += 1) {
      // map byte to [-1, 1]-ish
      vec.push((buf[i] / 127.5) - 1);
    }
    counter += 1;
    if (counter > 40) break;
  }
  // zero out hash reuse to exactly 512
  return normalize(vec.slice(0, 512));
}

export function normalize(v: number[]): number[] {
  let norm = 0;
  for (const x of v) norm += x * x;
  norm = Math.sqrt(norm) || 1;
  return v.map((x) => x / norm);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  // vectors assumed L2-normalized → dot == cosine
  return dot;
}

/** Simulate a "live" probe around the enrolled embedding with small noise. */
export function simulateProbe(enrolled: number[], live = true): number[] {
  const noise = live ? 0.04 : 0.35;
  const probe = enrolled.map((x) => x + (Math.random() - 0.5) * noise);
  return normalize(probe);
}
