# Threat model and initial risk register

Status: accepted initial technical baseline for non-actuating development

Method: asset and trust-boundary review using STRIDE-style categories, misuse cases, and safety/privacy impact. Ratings below are preliminary: likelihood and impact are Low, Medium, High, or Critical. Residual risk must be rated after controls are designed and tested.

## Assets and unacceptable outcomes

Protected assets include people and physical spaces, emergency egress, credential and biometric material, access policy, device/key identity, audit evidence, workforce data, administrator accounts, service availability, and organizational trust.

Unacceptable outcomes:

- an unauthorized or unexplained unlock;
- impaired emergency egress or unsafe door behavior;
- reuse, disclosure, or irreversible compromise of biometric/credential material;
- cross-organization data or authorization;
- an unrecorded, falsely attributed, or silently altered access decision;
- systematic unequal performance without detection and remedy;
- an offline or recovery mode that silently weakens access policy;
- inability to revoke a person, device, credential, key, or administrator promptly.

## Initial risk register

| ID | Scenario | Existing evidence | Initial risk | Required treatment | Accountable role | Phase gate |
|---|---|---|---|---|---|---|
| R-001 | Copied/static credential is replayed | Long-lived HMAC token and browser raw-token entry | Critical | Select replay-resistant protocol; freshness, reader/device binding, rate controls, replay tests | Security architecture | 4 |
| R-002 | Shared signing key compromise forges all cards | Organization-wide key with development fallback in `crypto.ts` | Critical | KMS/HSM custody, per-environment keys, asymmetric/hardware-backed design, rotation and compromise runbook | Security architecture | 2/4 |
| R-003 | Attacker mints demo credentials | Unauthenticated `kiosk/demo-cards` route | Critical | Exclude route and seed/demo identities from production artifact; CI assertion | Engineering | 1 |
| R-004 | Browser fabricates face/liveness pass | Client-generated probe and supplied scores/flags | Critical | Trusted capture/verification/PAD, evidence integrity, injection resistance | Biometric/security | 5 |
| R-005 | Fixed supervisor PIN bypasses denial | PIN `123456` is checked in the browser | Critical | Named strong authentication, server policy, limited scope/expiry, alert and audit | Identity/security | 2/6 |
| R-006 | Unmanaged client submits scans/config requests | Kiosk endpoints lack unique device authentication | Critical | Device provisioning, mTLS/workload identity, authorization and certificate revocation | Device/platform | 2/3 |
| R-007 | QR provider receives reusable credential | UI includes token in `api.qrserver.com` URL | High | Generate locally; prohibit credential in URLs/telemetry; log scanning | Engineering/security | 1/4 |
| R-008 | Biometric template is stolen or misused | Plain JSON vector on employee record | Critical | Necessity review, separate protected store/encryption, access boundaries, retention/deletion and breach response | Privacy/security | 2/5 |
| R-009 | Presentation or camera-injection attack passes | PAD and camera processing are simulated | Critical | Threat-based PAD, trusted capture, injection tests, independent evaluation | Biometric/security | 5 |
| R-010 | False match/reject unfairly affects a cohort | Simulated calibration and unmeasured FAR | Critical | Representative evaluation, cohort reporting, accessible fallback, appeal and monitoring | Biometric/product | 5/9 |
| R-011 | Offline kiosk accepts stale/revoked access | No durable client CRL/config/outbox policy | Critical | Signed expiring bundles, trusted time, bounded offline window, fail policy and reconciliation tests | Security/device | 6 |
| R-012 | Process restart loses session/pending decision | In-memory auth/mobile/pending-scan stores | High | Durable secure sessions and transaction state machine | Platform | 2/6 |
| R-013 | Webhook configuration enables SSRF/secret exposure | Arbitrary URL and plaintext JSON secret | High | Egress policy, DNS/IP validation, encryption, write-only secret, signed durable delivery | Platform/security | 2/7 |
| R-014 | Alert loss hides incident | Permissive unauthenticated ingress and memory buffer | High | Authenticate producer/consumer, durable queue, monitoring and dead-letter handling | SRE/security operations | 7 |
| R-015 | Audit evidence is altered or omitted | Best-effort ordinary rows described as immutable | High | Transactional append/tamper evidence, restricted access, external export and failure alarm | Security/data | 7 |
| R-016 | Cross-tenant authorization/data exposure | Organization identity is encoded in token but data model has limited tenant boundaries | Critical | Explicit tenant keys/relations, request context, row authorization and negative tests | Architecture/security | 2 |
| R-017 | Door channel is spoofed or wire is tampered | No controller integration yet | Critical | Approved ACU, supervised authenticated channel, device inventory and tamper alerts | Physical security | 3/6 |
| R-018 | Power/fire/REX design creates safety hazard | No physical integration or signed fail-mode design | Critical | Qualified life-safety design and witnessed test; application cannot override egress | Facilities/life safety | 0/6 |
| R-019 | Kiosk escape/local compromise steals data | Launcher and browser hold-to-exit are application controls | High | Managed OS lockdown, disk protection, least privilege, secure boot/update/watchdog | Device security | 3 |
| R-020 | Dependency/build defect reaches production | Type errors ignored; no CI application suite | High | Blocking CI, reproducible artifact, scanning/SBOM, review and rollback | Engineering | 1 |
| R-021 | Clock rollback extends expired/offline access | Browser/server time is not a trusted offline design | High | Trusted/monotonic time evidence, rollback detection, bounded leases | Device/security | 6 |
| R-022 | Insider abuses enrollment/reissue/override | Basic roles, best-effort audit, no dual control | High | Least privilege, separation/approval, MFA, anomaly detection and review | Identity/security | 2/7 |
| R-023 | Retention/deletion fails across backups/caches | Soft deletion and no verified lifecycle pipeline | High | Data map, retention jobs, deletion verification, backup expiry/legal hold | Privacy/data | 5/7 |
| R-024 | Denial or outage causes unsafe/unmanaged workaround | No agreed SLO, offline rule, or support procedure | High | Site fail-mode decision, SLOs, staffed fallback, drills and incident plan | Product/operations | 0/8 |

## Workshop agenda

1. Confirm assets, actors, sites, and diagrams.
2. Walk enrollment, issuance, presentation, verification, controller actuation, override, revocation, offline, deletion, update, and recovery flows.
3. For each trust boundary, test spoofing, tampering, repudiation, disclosure, denial, elevation, privacy, safety, and insider misuse.
4. Re-rate likelihood/impact for the actual site and chosen hardware.
5. Choose avoid, mitigate, transfer, or accept; name the person authorized to accept residual risk.
6. Convert treatments into traced requirements/tests and identify pilot stop conditions.

## Risk acceptance rule

Critical risks cannot be accepted for a real-door pilot. High residual risks require written acceptance from the security owner and the business owner; safety/privacy risks also require the responsible specialist. “Vendor handles it” is not a treatment without evidence, contract responsibility, and an integration test.

The project owner accepts this register as the Phase 1 engineering backlog baseline. No critical risk is accepted for production use. An independent multidisciplinary review remains a mandatory reopening gate before real-person organizational testing, vendor selection, or hardware actuation.
