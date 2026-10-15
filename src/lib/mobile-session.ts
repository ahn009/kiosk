// Employee self-service session store (mobile companion). Distinct from admin
// sessions. globalThis-backed so it survives Next.js dev hot-reloads.
interface MobileSession {
  employeeId: string;
  exp: number;
}

const KEY = Symbol.for("sentinelkiosk.mobile.sessions");
const g = globalThis as unknown as {
  [KEY]?: Map<string, MobileSession>;
};
const sessions: Map<string, MobileSession> = g[KEY] ?? new Map();
if (!g[KEY]) g[KEY] = sessions;

const TTL_MS = 60 * 60 * 1000; // 1 hour

export function createMobileSession(employeeId: string): string {
  // single active session per employee
  for (const [tok, s] of sessions.entries()) {
    if (s.employeeId === employeeId) sessions.delete(tok);
  }
  const token =
    "mob_" +
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2);
  sessions.set(token, { employeeId, exp: Date.now() + TTL_MS });
  return token;
}

export function getMobileSession(token: string | null | undefined) {
  if (!token) return null;
  const s = sessions.get(token);
  if (!s) return null;
  if (Date.now() > s.exp) {
    sessions.delete(token);
    return null;
  }
  return s;
}

export function destroyMobileSession(token: string | null | undefined) {
  if (token) sessions.delete(token);
}
