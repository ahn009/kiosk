# Task ID: 2 — Admin Dashboard Frontend

**Agent**: full-stack-developer
**Task**: Build the entire admin dashboard frontend under `src/components/admin/`.

## Status
✅ Complete. All 7 admin sections functional, hitting the real backend API.
Lint clean. TypeScript clean (in src/components/admin/).

## Files Created (9 total)

### Entry & shell (3)
- `src/components/admin/admin-app.tsx` — entry. If `useAppStore.admin` is null → `<LoginView/>`, else `<AdminShell/>`.
- `src/components/admin/login-view.tsx` — centered card on `bg-grid` background.
  Email/password fields with show/hide toggle, loading state, 4 quick-fill
  buttons (superadmin, security_officer, hr_admin, viewer), back-to-launcher.
  On success calls `login(token, admin)` + toast.
- `src/components/admin/admin-shell.tsx` — layout with sticky header, fixed
  left sidebar (collapsible via Sheet on mobile), main content with AnimatePresence
  view transitions, sticky footer with system status. Sidebar nav items
  role-gated. Header includes theme toggle (light/dark via `useTheme`), user
  dropdown (avatar + role badge), back-to-launcher, logout. System status card
  in sidebar (lockdown indicator, active kiosks, enrolled count). NavList
  component extracted to top-level (per `react-hooks/static-components` rule).
  Footer uses `mt-auto`.

### Views (6)
- `views/dashboard-view.tsx` — 4 KPI cards (Scans Today, Grant Rate, Active
  Kiosks, Enrolled Employees) with trend accent + loading skeletons. Lockdown
  red banner if active. Two charts via recharts: Area chart "Scans by Hour"
  (last 24h) and Bar chart "Scans by Kiosk" (granted vs denied stacked).
  3 secondary cards: FAR, FRR, Spoof Attempts Today. Recent Denials table
  (clickable → audit view).
- `views/employees-view.tsx` — table with avatar, name+code, department,
  designation, access level badge (color-coded by tier), card status badge
  (color-coded), face enrolled icon, card expires (relative). Row dropdown:
  View Details, Edit Profile, Reissue Card, Enroll Face, Revoke Card, Scan
  History, Delete. Search + department filter + status filter + pagination.
  Dialogs: Create/Edit (with access level slider 1-5), Details (full
  profile + card token hash), QR Token (uses api.qrserver.com img with
  fallback to styled text block, copy + print buttons, print opens new
  window with custom HTML), Revoke (reason textarea + suspend face switch,
  destructive), Delete (AlertDialog → soft-delete). Scan History Sheet
  with paginated event list. Components use `key` props so form state
  resets cleanly when target changes (avoids `react-hooks/set-state-in-effect`).
- `views/enrollment-view.tsx` — if no `enrollmentTargetId`, shows searchable
  employee picker. Otherwise wizard with 3-step Stepper:
  1. Consent (GDPR notice + checkbox + employee info card with timestamp)
  2. Capture (camera viewport via getUserMedia with graceful fallback,
     animated scanline during capture, 5 slots with quality metrics
     sharpness/brightness/faceSize + ScoreBar + retry per slot)
  3. Review & Submit (avg quality display, captures grid, decision logic
     preview, submit calls `enrollment.capture`, success state with
     animated check). After success, slots cleared and done state shown.
- `views/audit-view.tsx` — filters bar: kiosk select, decision select,
  date-from, date-to, employee search. Results table with: time, kiosk,
  employee, decision badge, face match status, score with bar, latency,
  offline + spoof flag icons. Row click → detail Sheet with snapshot
  placeholder (with CONFIDENTIAL watermark overlay for snapshot viewers),
  score/latency cards, employee info, token hash, spoof flags JSON
  pretty-printed. CSV export button (downloads current results). Pagination.
- `views/kiosks-view.tsx` — live heartbeat grid (pulsing dots), kiosk cards
  with status color, last sync, config version, CRL version, thresholds.
  Click → config editor Dialog with name/location inputs, status select,
  challenge mode select, threshold sliders (0.5-0.99 grant, 0.4-0.95
  challenge) with warning if challenge ≥ grant. Decision logic preview.
  Save calls `kiosks.update`.
- `views/security-view.tsx` — Lockdown control card (red banner if active,
  Initiate/Clear buttons with reason dialog/AlertDialog, role-gated).
  Tabs: Revocation List (table from `revocations.list()`), Admin Users
  (table from `admin.users()`, superadmin only), Admin Actions log
  (paginated, collapsible before/after JSON viewer), Webhook Config
  (Slack/Teams/email/generic, enable switch, event multi-select,
  min score, test button → toast).

### Shared libs (2)
- `lib/admin-utils.ts` — color/class maps (decisionClass, cardStatusClass,
  kioskStatusClass, faceMatchStatusClass, roleBadgeClass, accessLevelClass,
  roleLabel), date/number formatters (formatDateTime, formatTime,
  formatRelative, formatPct, formatNumber), initials helper, CSV download,
  copyToClipboard, **`asArray<T>(d)` helper** (normalises `{items: T[]}`
  vs `T[]` response shapes — the api-client typings declare bare arrays
  but several endpoints return `{items: [...]}` at runtime).
- `lib/ui-bits.tsx` — `KpiCard`, `EmptyState`, `ViewContainer` (Framer Motion
  fade-in wrapper), `TableSkeleton`, `ScoreBar`.

## API endpoints exercised (all 200 OK against seeded SQLite)
- POST /api/v1/auth/login
- GET /api/v1/dashboard/stats
- GET /api/v1/employees (list, with q/department_id/status filters)
- GET /api/v1/employees/[id] (detail)
- POST /api/v1/employees (create)
- PATCH /api/v1/employees/[id] (update)
- DELETE /api/v1/employees/[id] (soft-delete)
- POST /api/v1/employees/[id]/reissue-card
- POST /api/v1/employees/[id]/revoke
- GET /api/v1/employees/[id]/scan-history
- GET /api/v1/enrollment/[id]/status
- POST /api/v1/enrollment/[id]/capture
- GET /api/v1/audit/scans (with filters + pagination)
- GET /api/v1/kiosks (list)
- PATCH /api/v1/kiosks/[id] (config update)
- GET /api/v1/departments
- GET /api/v1/revocations
- GET /api/v1/admin/users
- GET /api/v1/admin-actions (paginated)
- POST /api/v1/admin/lockdown
- DELETE /api/v1/admin/lockdown

## Notes for Downstream Agents

1. **`asArray<T>(d)` helper** — `src/components/admin/lib/admin-utils.ts`.
   Use this when calling `apiClient.kiosks.list()`, `apiClient.departments.list()`,
   `apiClient.admin.users()`, `apiClient.revocations.list()`. The api-client
   typings declare these methods return bare `T[]`, but the backend actually
   returns `{ items: T[] }`. The helper normalises both shapes. The
   paginated endpoints (`employees.list`, `audit.scans`, `employees.scanHistory`,
   `admin.actions`) already return the documented `{items, total, page}` shape
   and don't need the helper.

2. **`AdminSection` type** lives in `src/lib/store.ts`, not `src/lib/types.ts`.
   Import it as `import { useAppStore, type AdminSection } from "@/lib/store";`.

3. **Form state in dialogs** — use a `key` prop on the dialog component
   (`key={"new-employee"}` or `key={`edit-${emp.id}`}`) so React remounts
   the form when the target changes. Avoid `useEffect(setState(...))` —
   the `react-hooks/set-state-in-effect` rule disallows it.

4. **NavList component** is defined at module level (not inside `AdminShell`)
   to satisfy the `react-hooks/static-components` rule that forbids defining
   components during render.

5. **Dark mode** — next-themes is configured in `providers.tsx`. Use
   `useTheme()` from `next-themes` and toggle between `"light"` / `"dark"`.
   Theme variables (bg-card, bg-primary, etc.) are defined in `globals.css`.

6. **Toast** — sonner is the primary toast system (mounted in `layout.tsx`).
   Use `import { toast } from "sonner"`.

7. **QR rendering** — used `https://api.qrserver.com/v1/create-qr-code/`
   as an `<img>` with onError fallback to a styled text block. The print
   flow opens a new window with custom HTML and triggers `window.print()`.

## Lint / TypeScript Status
- `bun run lint` → clean (no errors).
- `bunx tsc --noEmit` → no errors in `src/components/admin/`. (Unrelated
  errors remain in `examples/`, `skills/`, and `src/app/api/v1/kiosk/demo-cards/route.ts`.)
- Dev log shows all admin API calls returning 200 OK against the seeded
  SQLite database (15 employees, 4 kiosks, 4 admins, 112 audit scans,
  1 revoked card, 28 admin actions).
