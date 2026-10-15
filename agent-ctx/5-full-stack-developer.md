# Task ID: 5 — Threshold Calibration Admin View
Agent: full-stack-developer

## Scope (self-contained)
- CREATE `src/components/admin/views/calibration-view.tsx`
- CREATE `src/app/api/v1/calibration/route.ts` (POST — simulated ROC)
- MODIFY `src/components/admin/admin-shell.tsx` — add "Calibration" nav item
  (icon: `Gauge`, after "Kiosks", role-gated to security_officer + superadmin).
  On click: `setAdminSection("calibration")`.
- MODIFY `src/components/admin/admin-app.tsx` — render `<CalibrationView/>`
  when `adminSection === "calibration"`.
- MODIFY `src/lib/store.ts` — extend `AdminSection` to include `"calibration"`.

## Out-of-scope (DO NOT touch)
page.tsx, layout.tsx, api-client.ts, types.ts, crypto.ts, auth.ts, db.ts,
any other route, src/components/kiosk/*, all other admin views,
launcher.tsx.

## Inputs (read from prior agents' worklog)
- Foundation + admin + kiosk all done (Tasks 1, 2, 3, 4 in worklog.md).
- KioskDTO has thresholdGranted (Float, default 0.85), thresholdChallenge
  (Float, default 0.6), challengeMode, crlVersion, configVersion.
- `apiClient.kiosks.list()` → `KioskDTO[]`, `apiClient.kiosks.update(id, body)`
  → `KioskDTO`.
- `requireRole(req, ["security_officer","superadmin"])` for gating.
- `useAppStore().adminSection` + `setAdminSection`.
- `ViewContainer` from `@/components/admin/lib/ui-bits` for fade-in.
- `asArray<T>` helper to normalise `{items:T[]}` vs `T[]` shapes.
- Sonner `toast` for feedback; `recharts` for charts.

## Plan
1. Backend first — calibration route returns:
   `{ kioskId, genuineScores, impostorScores, roc:[{threshold,far,frr}],
      optimalThreshold, summary:{genuineCount,impostorCount,meanGenuine,
      meanImpostor,auc} }`.
2. Frontend — chart-heavy view with framer-motion fade-in via ViewContainer.
3. Wire nav + section render.
4. Lint, dev.log, browser smoke.

## Notes for next agent
- Calibration nav is role-gated: visible only to `security_officer` + `superadmin`.
- All thresholds are floats 0..1; AUC computed via trapezoidal rule on the
  ROC curve points (sorted by FAR ascending).
- Manual tuner sliders update the reference lines live (no API call) and only
  hit the API when "Save to kiosk" is pressed.
- Apply recommended thresholds → PATCH kiosks[id] with
  `{ thresholdGranted: optimalThreshold, thresholdChallenge: optimalThreshold - 0.1 }`
  clamped to valid ranges.
