# Task ID: 1 — Backend API Routes

**Agent**: full-stack-developer
**Task**: Build backend API routes for the KIOSK Access Control System.

## Status
✅ Complete. All 23 API route files + 3 supporting lib files created. Lint + TypeScript clean. End-to-end smoke tests pass.

## Files Created (26 total)

### Lib (3)
- `src/lib/kiosk-session.ts` — Pending-scan store (globalThis-backed, 5-min TTL).
- `src/lib/auth-runtime.ts` — Wrapper around `@/lib/auth` with globalThis-backed sessions Map (dev-mode hot-reload workaround). Re-exports `parseBody`, `ok`, `fail`, `extractBearer`, `logAdminAction` from auth.ts; re-implements `createSession`, `getSession`, `destroySession`, `requireAuth`, `requireRole`.
- `src/lib/mappers.ts` — Pure DTO mapping helpers: `toEmployeeDTO`, `toEmployeeDetail`, `toScanEventDTO`, `toKioskDTO`, `toAdminUserDTO`. Strips `pinHash`, `passwordHash`, `faceEmbedding`.

### Auth (3)
- `src/app/api/v1/auth/login/route.ts` — POST. `{email, password}` → `{token, admin: AdminUserDTO}`. 401 on fail.
- `src/app/api/v1/auth/refresh/route.ts` — POST. Re-issue token (rotates, single-active).
- `src/app/api/v1/auth/logout/route.ts` — POST. `{ok: true}`.

### Employees (5)
- `src/app/api/v1/employees/route.ts` — GET (paginated, q+department_id+status filters), POST (create, returns `cardToken`).
- `src/app/api/v1/employees/[id]/route.ts` — GET (detail), PATCH (update), DELETE (soft-delete + anonymize).
- `src/app/api/v1/employees/[id]/reissue-card/route.ts` — POST. Rotate card token.
- `src/app/api/v1/employees/[id]/revoke/route.ts` — POST. `{reason?, suspendFace?}`.
- `src/app/api/v1/employees/[id]/scan-history/route.ts` — GET. Paginated ScanEventDTO.

### Enrollment (2)
- `src/app/api/v1/enrollment/[employeeId]/capture/route.ts` — POST. Body `{images: string[3..5], consentAcknowledged: true}`. Generates 512-d embedding, stores as JSON.
- `src/app/api/v1/enrollment/[employeeId]/status/route.ts` — GET. `{status, qualityScore?, consentAcknowledged, enrolledAt?}`.

### Kiosk (4, no bearer auth)
- `src/app/api/v1/kiosk/verify-token/route.ts` — POST. Lockdown → verify → revocation → employee → cardStatus → faceEnrolled checks. Returns `{status:"await_face", scanId, employeeRef, challengeSeed}` or `{status:"denied", reason}`.
- `src/app/api/v1/kiosk/verify-face/route.ts` — POST. Computes cosineSimilarity(probe, enrolled). Decision matrix: paper_detected → challenge_failed, liveness < 0.87 → challenge_failed, score >= thresholdGranted → granted. Always writes ScanEvent (immutable audit). Returns VerifyFaceResponse with optional `employeeDisplay`.
- `src/app/api/v1/kiosk/sync/route.ts` — POST. Idempotent insert of offline events. Returns `{synced, crlVersion, revocations[]}` delta.
- `src/app/api/v1/kiosk/config/[kioskId]/route.ts` — GET. Returns kiosk thresholds, challengeMode, crlVersion, lockdown state.

### Admin / Dashboard / Audit (9)
- `src/app/api/v1/dashboard/stats/route.ts` — GET. Full DashboardStats (scansByHour, scansByKiosk, recentDenials, frr, far, etc.).
- `src/app/api/v1/audit/scans/route.ts` — GET. Paginated ScanEventDTO with filters (kiosk_id, employee_id, decision, from, to, page). Page size 25.
- `src/app/api/v1/admin/lockdown/route.ts` — POST (enable) + DELETE (disable). Bumps CRL version, marks kiosks status=lockdown.
- `src/app/api/v1/admin/users/route.ts` — GET. Superadmin only. AdminUserDTO list.
- `src/app/api/v1/departments/route.ts` — GET. `{id, name, code}`.
- `src/app/api/v1/kiosks/route.ts` — GET. KioskDTO list.
- `src/app/api/v1/kiosks/[id]/route.ts` — PATCH. Update thresholds/challengeMode/status. Increments configVersion.
- `src/app/api/v1/revocations/route.ts` — GET. Revocations joined to employee.
- `src/app/api/v1/admin-actions/route.ts` — GET. Paginated admin audit log joined to actor.

## Lint / TypeScript Status
- `bun run lint` → clean (no errors).
- `bunx tsc --noEmit` → no errors in `src/` or `prisma/`. (Unrelated errors in `examples/` and `skills/` directories which are out of scope.)

## Important Notes for Downstream Agents

1. **Auth helper**: Import auth helpers from `@/lib/auth-runtime` (NOT `@/lib/auth`).
   The wrapper uses globalThis so sessions survive Next.js dev hot reloads.
   Available exports: `createSession`, `getSession`, `destroySession`,
   `extractBearer`, `requireAuth`, `requireRole`, `parseBody`, `ok`, `fail`,
   `logAdminAction`.

2. **Kiosk session helper**: Import `createPendingScan`, `getPendingScan`,
   `deletePendingScan` from `@/lib/kiosk-session` (globalThis-backed).

3. **DTO mapping helpers**: Import from `@/lib/mappers` for consistent
   response shapes that strip sensitive fields.

4. **Login**: `POST /api/v1/auth/login` with `{email, password}`.
   Seeded credentials:
   - `admin@acme.io` / `Admin@2024` (superadmin)
   - `security@acme.io` / `Secure@2024` (security_officer)
   - `hr@acme.io` / `Hradmin@2024` (hr_admin)
   - `viewer@acme.io` / `View@2024` (viewer)

5. **Token TTL**: 30 minutes. Use `/api/v1/auth/refresh` to rotate.

6. **All routes use** `export const dynamic = "force-dynamic"` and
   `params` is awaited (`const { id } = await params;`) per Next.js 16.

7. **API contract**: All responses match the TypeScript interfaces in
   `src/lib/types.ts` (EmployeeDTO, EmployeeDetail, ScanEventDTO, KioskDTO,
   DashboardStats, VerifyTokenResponse, VerifyFaceResponse, AdminUserDTO,
   AuthSession, etc.).
