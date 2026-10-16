# Hardware laboratory plan

Status: acceptance protocol complete; candidate production hardware intentionally not selected

The initial reference rig is the developer laptop and its integrated camera. It supports virtual QR scanning and real frame-based face verification through production-shaped adapters. It is not a substitute for later reader, camera, controller, lock, power, environmental, and tamper testing.

## Inventory record

Complete one row per exact unit/firmware combination.

| Asset | Vendor/model | Serial/asset ID | Firmware/driver | Security profile/certification | Support/EOL | Evidence link |
|---|---|---|---|---|---|---|
| Credential/card | Virtual QR test credential | N/A | Versioned application format | Development only | N/A | [Development profile](DEVELOPMENT-PROFILE.md) |
| Card reader | Laptop camera QR adapter | Record locally before tests | Record current browser/OS | Development only | Developer-maintained | [Development profile](DEVELOPMENT-PROFILE.md) |
| Camera | Integrated laptop camera | Record locally before tests | Record current browser/OS | Development only | Developer-maintained | [Development profile](DEVELOPMENT-PROFILE.md) |
| Kiosk computer/TPM | Developer laptop | Record locally before tests | Record current OS/browser | Non-actuating development | Developer-maintained | [Development profile](DEVELOPMENT-PROFILE.md) |
| Access-control unit | Not selected—reopening trigger | N/A | N/A | N/A | N/A | Obtain before hardware gate |
| Lock/door contact/REX | Not selected—reopening trigger | N/A | N/A | N/A | N/A | Obtain before hardware gate |
| UPS/power equipment | Not selected—reopening trigger | N/A | N/A | N/A | N/A | Obtain before hardware gate |
| Network equipment | Local development network | N/A | Developer-managed | Development only | Developer-maintained | [Development profile](DEVELOPMENT-PROFILE.md) |

## Vendor evidence required

- supported protocols and security profile, not only a marketing compatibility claim;
- firmware signing/update/rollback and vulnerability disclosure process;
- support and end-of-life dates;
- device identity/key storage and factory/default credential behavior;
- secure configuration guide, ports, services, telemetry, and cloud dependency;
- environmental, electrical, accessibility, mounting, and regulatory requirements;
- data processing/sub-processor and remote-support behavior;
- known limitations for offline, tamper, multi-drop, controller, camera, and credential modes;
- independent certification/test evidence where required by the design.

## Laboratory topology rules

- Use an isolated network and a non-production controller/lock fixture.
- Test credentials must not work at a production site.
- Use current production-candidate firmware and preserve hashes/configuration exports.
- Record synchronized packet, application, device, controller, power, and door-state evidence where lawful and necessary.
- Do not retain real biometric material in general test artifacts.
- Provide a physical emergency cutoff; no test fixture may block required egress.

## Acceptance test groups

| Group | Cases | Required result |
|---|---|---|
| Credential | genuine, revoked, expired, altered, wrong issuer/tenant, clone/replay, rapid repeat, reissue, key rotation | Matches approved protocol and revocation targets; no unexplained accept |
| Reader | connect, read, cancel, timeout, unsupported card, disconnect, reconnect, cable tamper, firmware mismatch | Explicit bounded state; tamper/fault observable; no implicit allow |
| Camera/PAD | lighting, pose, distance, height, eyewear, covering, multiple face, photo/video/mask/injection corpus | Meets approved acquisition, PAD, cohort, and accessibility bounds |
| Device | cold boot, crash, watchdog, disk full, clock rollback, cert expiry, update/rollback, kiosk escape, port/device insertion | Fails as designed; remains recoverable, attributable, and managed |
| Network/offline | latency, loss, partition, DNS/proxy failure, stale config/CRL, queue backlog, reconnect | Approved offline window and deterministic reconciliation; no silent policy widening |
| Controller/door | authenticated channel, command/ack, contact mismatch, REX, held/forced door, fire, lockdown, power/UPS, manual access | Matches signed life-safety design; every command/result correlated |
| Privacy/logging | URLs, logs, traces, metrics, crash dumps, support bundle, browser/device storage | No raw credential, template/frame, password, token, secret, or unnecessary identity data |
| Load/soak | peak/burst traffic and 72-hour operation | Meets latency/error/thermal/resource targets without lost events or unsafe state |

## Procurement gate

Do not make a production-volume purchase until both candidate combinations have completed bench tests, integration ownership is clear, update/support lifetime meets the rollout plan, privacy/security terms are approved, and total cost includes spares, mounts, licensing, support, replacement, and secure disposal.
