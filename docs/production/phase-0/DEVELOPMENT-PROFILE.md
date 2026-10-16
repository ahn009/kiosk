# Initial development profile

Status: accepted project direction; production hardware remains undecided

Date: 2026-10-16

## Product intent

SentinelKiosk will be designed as a production-grade, multi-site access-control platform intended for later deployment with real readers, cameras, access-control units, and cloud infrastructure. The first test environment uses limited hardware only to make early development possible; it does not reduce the target architecture or its security requirements.

## First reference environment

| Capability | Initial implementation | Production extension point |
|---|---|---|
| Kiosk computer | Developer laptop | Managed kiosk appliance with device identity and hardened OS |
| Card | Virtual credential displayed on a second screen or phone | Enterprise mobile credential, smart card, or PACS credential selected through ADR-001 |
| Card reader | Laptop camera scanning a locally rendered QR | Reader adapter for NFC/smart-card/mobile/approved QR hardware |
| Face sensor | Laptop camera | Approved production camera through a camera adapter |
| Face verification | Real captured frames and a real versioned model; no generated employee-code embeddings | Replaceable local, on-premises, cloud, or hybrid biometric provider |
| PAD/liveness | A real development implementation with clearly measured limitations | Independently evaluated production PAD provider/model |
| Door/controller | Non-actuating test adapter only | PACS/access-control-unit adapter with authenticated supervised protocol |
| Deployment | Local development environment | Cloud/on-premises topology selected later through ADR-006 |
| Identities | Synthetic/test identities and the developer's voluntary test data | Approved workforce identity source and governed enrollment |

## Architecture rule

Business policy must not depend directly on browser APIs, a specific camera, QR library, biometric vendor, database provider, cloud, or door controller. Each external capability must implement a versioned interface and expose health, capabilities, errors, timeouts, and evidence suitable for audit.

The initial adapters are production-shaped reference implementations:

- `CredentialReader`: obtains credential evidence; it does not decide access.
- `CameraCapture`: returns actual frames and capture metadata; it does not manufacture scores.
- `BiometricVerifier`: returns versioned match/PAD evidence from real input.
- `PolicyDecision`: combines trusted evidence and policy in a server-controlled boundary.
- `AccessController`: requests actuation and reports acknowledgement/door state; the development adapter can never actuate hardware.
- `EventSink`: durably accepts idempotent, correlated security events.

## Initial user journey

1. An administrator creates a synthetic test identity and issues a short-lived virtual test credential.
2. The application renders the credential locally; no credential is sent to a QR image service.
3. The credential is displayed on a phone or second screen and scanned with the laptop camera.
4. The same camera is deliberately released and reacquired for face capture, with clear UI state and permission/error handling.
5. Real frames enter the development biometric/PAD pipeline; model and threshold versions are recorded.
6. The server evaluates the credential, biometric evidence, policy, retry limits, and transaction freshness.
7. The non-actuating controller adapter records what would have happened.
8. The complete correlated decision appears in audit and monitoring.

## Development constraints

- A single laptop camera cannot scan a virtual card shown on the same laptop screen without another presentation mechanism. Initial testing assumes a phone/second display or an explicit image-import test adapter that is disabled in production.
- Camera ownership must be sequential: credential scan, release, face capture. The UI must never imply that both are being captured when only one stream exists.
- Development face/PAD performance is not production evidence. The UI must label its assurance level and must not display invented FAR, liveness, spoof, or quality values.
- Test data must be isolated from future production data and removable through a documented deletion action.
- The controller adapter must be incapable of reaching a relay, smart lock, production PACS, or live door.

## Completion criteria for this profile

- every external capability is behind an interface with a contract test;
- virtual credential scanning uses real camera pixels and local QR rendering;
- face verification uses real frames and produces reproducible versioned evidence;
- simulated biometric, liveness, card, override, and metric code is absent from the production build;
- the non-actuating adapter makes live-door operation technically impossible;
- production hardware and cloud adapters can be added without rewriting access policy or audit semantics.
