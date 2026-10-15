// Auth runtime — a thin wrapper around `@/lib/auth` that exposes the SAME API
// but stores sessions on `globalThis` so they survive Next.js dev-mode hot
// reloads (each route handler gets its own module instance of `@/lib/auth`,
// so the in-memory Map is duplicated per route in dev. globalThis is shared
// across all module instances in the same Node process, which is what we
// need).
//
// This module REUSES auth.ts for: parseBody, ok, fail, extractBearer,
// logAdminAction (all pure, no module state). It re-implements createSession,
// getSession, destroySession, requireAuth, requireRole to use a globalThis
// Map. The semantics match auth.ts exactly (TTL, single-active-session
// revocation, role gating).

import { NextRequest, NextResponse } from "next/server";
import {
  parseBody as _parseBody,
  ok as _ok,
  fail as _fail,
  extractBearer as _extractBearer,
  logAdminAction as _logAdminAction,
} from "@/lib/auth";
import type { AdminRole } from "@/lib/types";

export const parseBody = _parseBody;
export const ok = _ok;
export const fail = _fail;
export const extractBearer = _extractBearer;
export const logAdminAction = _logAdminAction;

interface SessionData {
  adminId: string;
  email: string;
  role: AdminRole;
  name: string | null;
  exp: number;
}

const g = globalThis as unknown as { __kioskAuthSessions?: Map<string, SessionData> };
if (!g.__kioskAuthSessions) g.__kioskAuthSessions = new Map();
const sessions = g.__kioskAuthSessions;

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 min — matches auth.ts

export function createSession(admin: {
  id: string;
  email: string;
  role: AdminRole;
  name: string | null;
}): string {
  // Revoke old session for same admin (single active)
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

export async function requireAuth(req: NextRequest) {
  const token = extractBearer(req);
  const session = getSession(token);
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, response: null };
}

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
