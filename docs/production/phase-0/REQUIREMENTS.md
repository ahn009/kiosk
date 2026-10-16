# Phase 0 requirements baseline

Status: accepted baseline for non-actuating software development

## Product boundary

SentinelKiosk is intended to verify an employee credential and, if approved, a biometric factor before requesting access through an existing physical access-control system (PACS). The system also supports enrollment, credential lifecycle, policy administration, audit, alerts, and employee self-service.

The product target is a complete production-grade, multi-site system. The initial laptop/webcam/virtual-card setup is a reference environment for building and testing the same modular interfaces that later connect to production hardware and cloud infrastructure. See the [initial development profile](DEVELOPMENT-PROFILE.md).

The production product is not yet authorized to:

- directly energize a lock or bypass a certified access-control unit;
- replace required fire, egress, request-to-exit, accessibility, or emergency mechanisms;
- use facial recognition for surveillance or unidentified-person search;
- use access/biometric results for employment or disciplinary decisions without a separately approved policy;
- retain raw biometric images by default;
- silently remove the non-biometric access path.

## Deployment facts to complete

| Fact | Required answer | Owner |
|---|---|---|
| Current project use | Personal research and development; no live-door actuation | Product |
| Organization/legal entity | None selected for production deployment | Product/legal |
| Countries, states, and cities | Not applicable until a deployment/pilot site is selected; Phase 0 reopens then | Legal |
| Initial test site | Developer workspace/laboratory; exact location not required in repository | Product |
| Initial door and security classification | No door; non-actuating software test | Physical security |
| Existing PACS/controller and firmware | None | Integrator |
| Existing credential/card technology | Virtual QR test credential | Physical security/identity |
| Initial credential presentation | Phone or second screen presented to laptop camera | Product |
| Initial camera | Developer laptop camera | Engineering |
| Target employee/contractor population | Synthetic test identities initially; selecting a production population reopens Phase 0 | HR/product |
| Initial design load | 10 credential presentations/minute per kiosk; load tests must also cover 5× burst | Product/SRE |
| Initial environment | Indoor developer workspace; production environmental qualification deferred | Facilities |
| Initial network | Local development network; selecting a production network reopens Phase 0 | IT/network |
| Required offline duration | Zero for access decisions in the initial profile; no network means no allow | Security/operations |
| Initial language/accessibility | English; WCAG 2.2 AA design target; production languages/user needs reopen Phase 0 | Product/accessibility |
| Initial support | Developer-operated; no production SLA | Operations |
| Initial data rule | Synthetic identities; voluntary developer biometric data removed on request/test completion; no raw-frame retention by default | Privacy/legal |
| Initial recovery targets | RTO 4 hours and RPO 15 minutes as production design baselines; final business targets reopen Phase 0 | Business/operations |

## Functional requirements

IDs are stable references for ADRs, tests, and release evidence.

### Identity and credential

- FR-ID-001: an administrator must authenticate through the approved organization identity provider before accessing administration functions.
- FR-ID-002: privileged operations must require the approved strong-authentication level and produce an attributable audit event.
- FR-ID-003: every kiosk must have a unique, revocable device identity; a shared kiosk secret is not sufficient.
- FR-CR-001: the system must support issue, activate, verify, expire, suspend, revoke, report lost, replace, renew, and destroy states for each credential.
- FR-CR-002: a revoked or replaced credential must not become valid again because of retry, restart, failover, or offline reconciliation.
- FR-CR-003: credential verification must bind the issuer, organization, credential, verifier/device, validity, freshness, and applicable policy.
- FR-CR-004: reusable credential material must never be placed in a third-party QR/image URL, analytics payload, ordinary log, or crash report.
- FR-CR-005: the initial virtual card must be rendered locally and scanned from real camera pixels; image import may exist only as an explicitly labelled test adapter excluded from production.

### Biometric and accessibility

- FR-BIO-001: enrollment must process actual approved camera frames, not an employee identifier or generated vector.
- FR-BIO-002: matching and presentation-attack detection (PAD) must run in an approved trusted boundary and must not trust browser-asserted scores.
- FR-BIO-003: every template and decision must identify the model, PAD, threshold, policy, and device versions used.
- FR-BIO-004: retries, timeout, recovery, and escalation must be bounded and measurable.
- FR-BIO-005: a usable non-biometric alternative must be available and must not impose an unjustified penalty.
- FR-BIO-006: a person must be able to receive notice, exercise applicable rights, challenge a denial, withdraw where permitted, and have data deleted under the approved policy.
- FR-BIO-007: the initial laptop-camera implementation must use real captured frames and a versioned biometric/PAD implementation; deterministic vectors, randomized quality, and fabricated liveness/spoof results are prohibited.

### Access decision and door

- FR-ACS-001: final authorization must execute in a trusted service/controller boundary; browser state alone must never cause an unlock.
- FR-ACS-002: each attempt must preserve the credential result, biometric/PAD result when used, policy result, command request, controller acknowledgement, and observed completion state.
- FR-ACS-003: lockdown, request-to-exit, fire/egress, power loss, maintenance, and manual procedures must follow the signed site design.
- FR-ACS-004: a supervisor override must identify the supervisor, reason, allowed scope, expiry, decision, and resulting hardware action.
- FR-ACS-005: any door command must travel through the approved authenticated and supervised controller interface.
- FR-ACS-006: the initial development controller adapter must be technically incapable of actuating a physical device while preserving the production command/acknowledgement event contract.

### Offline, audit, and operations

- FR-OFF-001: offline access must be explicitly enabled per site/door and bounded by signed policy age, revocation age, trusted time, and device health.
- FR-OFF-002: locally stored policy, revocation, credential, and event data must be encrypted and integrity protected.
- FR-OFF-003: queued events require globally unique IDs, ordering/version context, idempotent ingestion, and conflict handling.
- FR-AUD-001: security events and privileged actions must be durable, attributable, time-correlated, access-controlled, and tamper evident.
- FR-AUD-002: logs must not contain raw credentials, biometric templates/frames, authentication secrets, session tokens, or webhook secrets.
- FR-OPS-001: the system must expose redacted health, metrics, logs, and traces adequate to identify kiosk, dependency, controller, and synchronization failures.
- FR-OPS-002: application, policy, model, firmware, key, and certificate changes must support staged rollout and rollback/recovery.

## Non-functional acceptance measures

These are initial architecture targets. A real deployment must confirm or strengthen them using site traffic, risk, hardware, and jurisdiction evidence.

| Measure | Target | Measurement method | Owner |
|---|---:|---|---|
| Online decision availability | 99.9% monthly production design target | Synthetic and production SLI | Product/SRE |
| Decision latency p50/p95/p99 | ≤1.0s / ≤2.0s / ≤3.0s excluding user interaction | End-to-end event timestamps | Product/SRE |
| Credential read success | ≥99.5% for supported presentations in qualified conditions | Attempts by supported credential/device | Hardware lead |
| Revocation propagation | ≤60s online; offline allow disabled initially | Controlled revoke/read test | Security lead |
| False match rate | ≤1 in 10,000 initial minimum; deployment risk may require stronger | Independent representative evaluation | Biometric lead |
| False non-match/failure to acquire | <5% initial target, reported separately and by relevant cohort/environment | Representative evaluation | Biometric/accessibility |
| PAD performance | IAPAR <0.07 initial baseline plus declared attack coverage | Defined attack and bona fide corpus | Security/biometric |
| Controller acknowledgement/door mismatch | Zero unexplained mismatches | Hardware-in-loop telemetry | Integrator |
| Audit event durability and sync lag | Zero acknowledged-event loss; online p95 ingestion ≤5s | Failure/partition tests | SRE/security |
| Critical alert delivery | p95 ≤60s to the configured receiver | Incident exercises | Security operations |
| Recovery time/recovery point | RTO ≤4h / RPO ≤15m initial baseline | Restore/DR exercise | Business/SRE |

NIST SP 800-63B's current biometric requirements are the initial assurance baseline, including the use of a physical authenticator with biometrics, PAD for facial recognition, demographic performance testing, and a non-biometric option. Final targets must also satisfy the deployment's law, policy, and risk assessment.

## Phase 0 acceptance criteria

- Every deployment fact has an answer, owner, or dated blocker.
- Every functional requirement is accepted, changed through review, or explicitly rejected with a risk owner.
- Every measurable target has a definition, data source, threshold, and accountable owner.
- Conflicting requirements are resolved in an ADR.
- Requirements are traceable to Phase 1+ backlog work and tests.
