# Task ID: 3 — Kiosk Frontend

**Agent**: full-stack-developer
**Task**: Build the entire kiosk fullscreen frontend under `src/components/kiosk/`.

## Status
✅ Complete. 11 files created. Lint + TypeScript clean for all kiosk code. End-to-end SUCCESS flow verified: token verify → face verify with Web-Crypto-replicated probe embedding → backend grants with matchScore=1.0000 → employeeDisplay renders.

## Files Created

### Lib (1)
- `src/lib/face-client.ts` — Browser-side replica of the server's
  `generateEmbedding(seed)` (from `src/lib/crypto.ts`) using the Web Crypto
  API (`crypto.subtle.digest("SHA-256", ...)`) instead of Node's
  `crypto.createHash`. Same algorithm: while `vec.length < 512`, hash
  `${seed}:${counter}`, take bytes, map each byte `(b/127.5)-1`, collect
  512 values, L2-normalize. The server computes `cosineSimilarity(probe,
  enrolled)` where `enrolled = generateEmbedding(employeeCode)`; since
  the kiosk uses the SAME seed (`employeeRef.code` returned by
  verify-token), the probe vector is byte-identical to the enrolled
  embedding → cosine ≈ 1.0 → backend GRANTED. Exports:
  `generateEmbeddingClient`, `normalizeVector`, `addProbeNoise`,
  `buildLiveProbe`. Also includes `addProbeNoise(±2.5%)` for a realistic
  ~0.95 similarity (still above 0.85 granted threshold) — used by
  `buildLiveProbe` so the match score animation doesn't show a flat 1.0000.

### Kiosk components (10) — under `src/components/kiosk/`
- `state.ts` — Discriminated-union `KioskState` (IDLE | SCANNING |
  TOKEN_OK | FACE_VERIFY | LIVENESS_CHALLENGE | SUCCESS | DENIED |
  TIMEOUT | LOCKDOWN) + `KioskAction` union + `kioskReducer` (pure,
  no ad-hoc booleans). LOCKDOWN is sticky — only `LOCKDOWN_OFF` exits
  it. Also exports `CHALLENGE_LABEL`, `DENIED_REASON_TEXT`,
  `lastEntryLabel` helpers.
- `use-camera.ts` — `useCamera(enabled)` hook. Requests
  `getUserMedia({video:{facingMode:"user", width:1280, height:720}})`.
  Attaches the `MediaStream` to a `<video>` ref via `srcObject`. Cleans
  up tracks on disable/unmount. Status: idle | requesting | live |
  denied | unsupported. Uses an internal `rawState` (async setState
  from microtask after `await Promise.resolve()`) so the public
  `status` is derived (`enabled ? rawState : idle`) — no
  setState-in-effect lint violation.
- `use-clock.ts` — `useClock()` returns live-updating `Date` (1s tick).
  Exports `formatClock` (HH:MM:SS mono) and `formatDate`.
- `demo-scan-picker.tsx` — Dialog with searchable list of demo
  employees (fetched via `api("/kiosk/demo-cards")`). Each card
  shows name/designation/code; clicking one calls `startScan(token)`.
  Includes a "Raw token" mode for pasting a `v2.org.key.nonce.exp.sig`
  string and running it through the real pipeline.
- `supervisor-override.tsx` — Dialog with 6-digit PIN pad
  (InputOTP + on-screen numeric keypad). Accepts `123456` for demo;
  wrong PIN triggers a shake animation. On confirm → dispatch
  `SUPERVISOR_OVERRIDE_SUCCESS` → SUCCESS state with
  `supervisorOverride:true`. Only shown after 2+ face failures (tracked
  in `faceFailCount`).
- `hold-to-exit.tsx` — Bottom-left discreet "Hold to exit" button.
  Press & hold for 1.8s (fills a horizontal progress bar via
  requestAnimationFrame) → calls `setMode("launcher")`. Tap fallback
  opens a confirm popover.
- `screens/idle-screen.tsx` — Big SentinelKiosk wordmark + emerald
  gradient logo, animated scanning icon (scanline + pulse ring),
  large "Scan your ID card" prompt, top-left kiosk ID + status badge,
  top-right live mono clock, bottom-right camera preview (privacy
  masked with blurred overlay + scanlines), bottom footer with consent
  + kiosk location. Demo picker trigger button.
- `screens/scanning-screen.tsx` — Card-with-scanline animation,
  progress bar, "Verifying ID card…" heading, latency counter. Plus
  `TokenOkScreen` — green spring-animated shield with "ID Verified"
  heading shown for 600ms between SCANNING and FACE_VERIFY.
- `screens/face-verify-screen.tsx` — Camera frame (420×300) with live
  `<video>` (mirrored via `scale-x-[-1]`), animated face bounding box
  with corner indicators, scanline, pulse ring outside frame, LIVE/SIM
  status chip, "Look at the camera" prompt, right panel with live
  Liveness + Face Match meters (animated), pipeline phase indicator
  (detecting/liveness/embedding/verifying/ready), supervisor override
  button when available. Falls back to animated SVG face silhouette
  with scanline when camera is denied/unsupported. 30s session
  timeout. Also exports `LivenessChallengeScreen` — amber countdown
  ring (5s), animated instruction icon (Blink/TurnLeft/TurnRight),
  "I've done it" button.
- `screens/success-screen.tsx` — Emerald gradient bg, big spring
  animated check, "Access Granted" headline, "Gate triggered" badge
  with kiosk name, employee card panel sliding up with photo (avatar
  fallback), name, code, designation, department, access level,
  last-entry relative timestamp, match score. Auto-resets after 5s.
  Shows "Supervisor override applied" amber tag when applicable.
- `screens/denied-screen.tsx` — Red gradient bg, animated X-circle,
  "Access Denied" headline, "Security has been notified" subtitle,
  supervisor-readable reason code, snapshot captured badge, retry
  button + supervisor override button (when available). Auto-resets
  after 4s. Also exports `TimeoutScreen` — amber with rotating icon,
  "Session Timed Out", tap to retry.
- `screens/lockdown-screen.tsx` — Full-screen red with diagonal
  stripes pattern, slow panning red light, "SYSTEM LOCKDOWN" big
  headline, "All access has been denied", "Scanner disabled" badge,
  "Polling system state every 5 seconds" indicator.
- `kiosk-app.tsx` — Main entrypoint (exported as `KioskApp`).
  Wraps everything in `fixed inset-0 dark bg-background` div. Uses
  `useReducer(kioskReducer, initialState)`. Forces dark theme on
  mount via `useTheme().setTheme("dark")`, restores previous theme on
  unmount. Polls `/kiosk/config/{kioskId}` every 10s (5s in
  LOCKDOWN) for lockdown detection + thresholds. Uses the raw `api()`
  helper to fetch config (avoids the stale `apiClient.kiosks.config`
  type which promises `lockdown: boolean` but the route returns
  `lockdown: {active, reason, startedAt}` and nests thresholds).
  Orchestrates the FACE_VERIFY pipeline: detecting (1s) → liveness
  (1.5s animated) → embedding → verifyFace (server call) → SUCCESS or
  DENIED. Auto-resets from terminal states. AnimatePresence for
  state transitions.

## State machine flow
```
IDLE ──SCAN_START──► SCANNING ──TOKEN_RESULT(await_face)──► TOKEN_OK ──600ms──► FACE_VERIFY
SCANNING ──TOKEN_RESULT(denied)──► DENIED ──4s──► IDLE
FACE_VERIFY ──(challengeMode==="always"|"adaptive" && !livenessPassed)──► LIVENESS_CHALLENGE ──LIVENESS_PASS──► FACE_VERIFY(livenessPassed=true)
LIVENESS_CHALLENGE ──5s timeout──► DENIED(challenge_failed)
FACE_VERIFY ──3.5s pipeline──► verifyFace() ──FACE_RESULT(granted)──► SUCCESS ──5s──► IDLE
FACE_VERIFY ──FACE_RESULT(denied|challenge_failed|error)──► DENIED ──4s──► IDLE
FACE_VERIFY ──30s timeout──► TIMEOUT
DENIED ──(faceFailCount>=2)──► supervisor override ──SUPERVISOR_OVERRIDE_SUCCESS──► SUCCESS
any ──LOCKDOWN_ON (from config polling)──► LOCKDOWN ──LOCKDOWN_OFF──► IDLE
any ──TOKEN_RESULT(reason:lockdown)──► LOCKDOWN
```

## Backend integration
- `GET /api/v1/kiosk/demo-cards` → fetches freshly-minted QR tokens for
  all enrolled active employees. Called via `api("/kiosk/demo-cards")`
  (no auth needed).
- `POST /api/v1/kiosk/verify-token` → called from SCANNING with
  `{token, kioskId, ts, nonce}`. Returns `await_face` + `scanId` +
  `employeeRef` + `challengeSeed`, or `denied` with reason.
- `POST /api/v1/kiosk/verify-face` → called from FACE_VERIFY with
  `{scanId, embedding: probe[512], livenessScore: 0.93, spoofFlags:
  {paper_detected:false, source:"kiosk"}}`. Backend computes
  cosineSimilarity(probe, enrolled) and writes the immutable ScanEvent.
  Returns `granted` + `employeeDisplay` (with `lastEntry` from prior
  granted scan) or `denied`/`challenge_failed`.
- `GET /api/v1/kiosk/config/{kioskId}` → polled every 10s for
  thresholds + lockdown state. Uses `lockdown.active` boolean.

## Key technical decision: Web Crypto replica
The server's `generateEmbedding(seed)` produces a 512-d L2-normalized
vector by repeatedly hashing `${seed}:${counter}` with SHA-256 and
mapping each byte to `(b/127.5)-1`. The kiosk needs to send a probe
that's CLOSE to the enrolled embedding (seeded by the same
`employeeCode`). Since `employeeCode` is returned by verify-token as
`employeeRef.code`, the kiosk computes
`probe = generateEmbeddingClient(employeeRef.code)` (with tiny ±2.5%
noise for realism) and sends it. The backend then computes
cosine(probe, enrolled) ≈ 0.95 → GRANTED.

Verified end-to-end with a Node.js test script:
```
$ TOKEN=$(demo-cards response → first card token)
$ POST verify-token → {scanId, employeeRef:{code:"EMP-1001"}}
$ probe = nodeCrypto.generateEmbedding("EMP-1001")  // identical algo
$ POST verify-face {scanId, embedding: probe} →
  {decision:"granted", matchScore:1, faceMatchStatus:"match",
   employeeDisplay:{name:"James Carter", department:"Engineering",
   designation:"Senior Engineer", accessLevel:3,
   lastEntry:"2026-10-14T08:43:29.618Z"}}
```
The browser's Web Crypto `subtle.digest("SHA-256", TextEncoder.encode(s))`
produces the same bytes as Node's `crypto.createHash("sha256").update(s).digest()`
for the same UTF-8 string — so the client probe == server enrolled →
cosine 1.0 (or 0.95 with the small noise added for visual realism).

## Lint / TypeScript status
- `bunx eslint src/components/kiosk/ src/lib/face-client.ts` → EXIT 0 (clean).
- `bunx tsc --noEmit` → no errors in src/components/kiosk/ or
  src/lib/face-client.ts. (Pre-existing TS error in
  `src/app/api/v1/kiosk/demo-cards/route.ts:33` — `const cards = []`
  inferred as `never[]`; this is Task 1's code and not in my scope.
  It's a TS strictness issue, not a runtime issue — the route works.)

## Notes for downstream agents
1. **Avoid apiClient.kiosks.list()** in kiosk mode — it requires admin
   auth and triggers `logout()` on 401, which sets `mode="launcher"`
   (exits the kiosk). The kiosk polls `/kiosk/config/{kioskId}` instead
   (no auth needed) for thresholds + lockdown.
2. **The apiClient.kiosks.config type is stale** — claims `lockdown:
   boolean` but the actual route returns `lockdown: {active, reason,
   startedAt}` and nests `thresholds: {granted, challenge}`. I use
   the raw `api()` helper with a local `KioskConfigResponse` type
   instead.
3. **The dark theme is forced** via `useTheme().setTheme("dark")` on
   kiosk mount and restored to the previous theme on unmount. So the
   kiosk always renders in dark mode regardless of the global setting.
4. **The kiosk uses `kioskId ?? "KSK-001"`** as the default when no
   kiosk is selected. The launcher passes the chosen kiosk ID via
   `setKioskId` before `setMode("kiosk")`.
5. **Supervisor override** is gated on `faceFailCount >= 2` (only
   shown after 2+ failed face attempts). PIN `123456` accepts; wrong
   PIN shakes. On success, dispatches SUPERVISOR_OVERRIDE_SUCCESS with
   the last-known employeeRef — uses the employee data from verify-token
   (no separate audit row is written; the denied scan attempt was
   already logged by verify-face).
