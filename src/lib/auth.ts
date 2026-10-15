import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySecret } from "@/lib/crypto";
import type { AdminRole } from "@/lib/types";

// Simple in-memory JWT-like session tokens (demo). Real impl uses RS256 JWTs.
// Map: token -> { adminId, email, role, name, exp }
const sessions = new Map<
  string,
  { adminId: string; email: string; role: AdminRole; name: string | null; exp: number }
>();

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 min

export function createSession(admin: {
  id: string;
  email: string;
  role: AdminRole;
  name: string | null;
}): string {
  // revoke old session for same admin (single active)
  for (const [tok, s] of sessions.entries()) {
    if (s.adminId === admin.id) sessions.delete(tok);
  }
  const token =
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2);
  sessions.set(token, {
    adminId: admin.id,
    email: admin.email,
    role: admin.role,
    name: admin.name,
    exp: Date.now() + SESSION_TTL_MS,
  });
  return token;
}

export function getSession(token: string | null | undefined) {
  if (!token) return null;
  const s = sessions.get(token);
  if (!s) return null;
  if (Date.now() > s.exp) {
    sessions.delete(token);
    return null;
  }
  return s;
}

export function destroySession(token: string | null | undefined) {
  if (token) sessions.delete(token);
}

export function extractBearer(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

/** Require an authenticated admin. Returns session or a 401 NextResponse. */
export async function requireAuth(req: NextRequest) {
  const token = extractBearer(req);
  const session = getSession(token);
  if (!session) {
    return {
      session: null,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }
  return { session, response: null };
}

/** Require an admin with one of the given roles. */
export async function requireRole(req: NextRequest, roles: AdminRole[]) {
  const auth = await requireAuth(req);
  if (auth.response) return { session: null, response: auth.response };
  if (!roles.includes(auth.session!.role)) {
    return {
      session: null,
      response: NextResponse.json(
        { error: "Forbidden — insufficient role" },
        { status: 403 }
      ),
    };
  }
  return { session: auth.session, response: null };
}

/** Convenience: parse JSON body safely. */
export async function parseBody<T = unknown>(req: NextRequest): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Record an admin action for the audit log. Best-effort. */
export async function logAdminAction(opts: {
  actorId?: string;
  target: string;
  action: string;
  before?: unknown;
  after?: unknown;
}) {
  try {
    await db.adminAction.create({
      data: {
        actorId: opts.actorId ?? null,
        target: opts.target,
        action: opts.action,
        beforeData: opts.before ? JSON.stringify(opts.before) : null,
        afterData: opts.after ? JSON.stringify(opts.after) : null,
      },
    });
  } catch {
    // best-effort
  }
}
