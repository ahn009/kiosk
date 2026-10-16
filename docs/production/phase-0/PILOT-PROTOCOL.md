# Real-world pilot protocol

Status: protocol accepted; no real-person organizational or live-door pilot authorized

The first execution is a developer test, before Gate A: one laptop, its camera, a virtual QR shown on a phone or second display, synthetic identities, real captured face frames, and a non-actuating controller adapter. This validates software interfaces only and does not count as production biometric, hardware, privacy, or life-safety evidence.

## Purpose

Validate the selected credential, biometric, kiosk, policy, controller, offline, audit, support, privacy, and accessibility design under controlled conditions. A pilot is an evidence-gathering exercise, not a shortcut to production.

## Preconditions for any real person or real credential

- named pilot owner, security owner, privacy/legal owner, facilities owner, and stop authority;
- approved participant notice/consent or other lawful process, plus a usable non-biometric route;
- defined purpose, fields, access, retention, deletion, support, and incident handling;
- test credentials cannot grant ordinary production access during bench/shadow stages;
- approved hardware/firmware inventory and isolated test environment;
- participant support, denial appeal, withdrawal, and data-deletion procedure;
- test plan and stop conditions communicated before collection begins.

## Gate A — bench validation

Access effect: none.

- Use test identities and clearly marked test credentials.
- Execute genuine, malformed, altered, expired, revoked, replaced, wrong-tenant, copied/replayed, and rapid-repeat cases.
- Test approved cameras across lighting, pose, eyewear/covering, height, background, multiple-face, photo/video/mask/injection attacks defined by the threat model.
- Test reader/controller disconnect, wiring tamper, network partition, clock rollback, restart, disk full, power loss, UPS exhaustion, stale policy/revocation, certificate expiry, and failed update/rollback.
- Confirm no sensitive material enters logs, URLs, analytics, support bundles, or crash reports.
- Run at least the Phase 4 roadmap transaction volume before moving forward.

Evidence: signed hardware-in-loop report, defects and retests, raw aggregate measurements, security review, and go/no-go minutes.

## Gate B — shadow mode

Access effect: SentinelKiosk cannot unlock; the existing approved access path remains authoritative.

- Start at one monitored site with a small, voluntary, representative cohort.
- Compare each SentinelKiosk result to the authoritative result and investigate every disagreement.
- Record environmental/accessibility context without collecting unnecessary sensitive attributes.
- Staff support during test windows and delete participant data on withdrawal under the approved procedure.
- Review results and incidents daily; do not tune thresholds on evaluation data without versioning and a new evaluation.

Evidence: confusion/error counts with denominators, latency percentiles, cohort/environment breakdown, fallback/retry/abandonment, participant feedback, incidents, deletions, and residual risks.

## Gate C — controlled non-critical door

Access effect: limited actuation only after written Gate B, security, privacy, and life-safety approval.

- Select a non-critical interior door during staffed hours with immediate approved fallback.
- Allowlist a small cohort and schedule; keep the established access method available.
- Use a witnessed preflight for fire/egress, REX, lockdown, power, network, controller, door contact, manual access, monitoring, and rollback.
- Review every denial, override, offline decision, controller mismatch, and alert daily.
- Automatic disable triggers must be technically enforceable, not only procedural.

## Gate D — limited production cohort

Access effect: bounded production use.

- Expand one dimension at a time: population, hours, doors, or sites.
- Hold formal reviews after 1, 7, 30, and 90 days.
- Keep rollback, spares, vendor contacts, support, and non-biometric access ready.
- Revalidate after material model, threshold, camera, reader, controller, population, environment, or policy changes.

## Mandatory stop conditions

Stop the affected pilot immediately for:

- any unexplained or unauthorized unlock;
- unsafe egress, fire, lockdown, power, or door behavior;
- successful credential replay/cloning outside the approved test case;
- cross-organization/cross-person disclosure or authorization;
- missing, falsely attributed, or materially inconsistent audit evidence;
- uncontrolled exposure of credential, biometric, secret, session, or key material;
- performance outside approved overall or cohort bounds;
- an unavailable non-biometric/accessibility path;
- unapproved purpose expansion or material privacy breach;
- inability to revoke a person, credential, kiosk, certificate, key, or administrator within the target.

The stop authority may disable SentinelKiosk without waiting for a change meeting. Restart requires root-cause evidence, remediation, retest, and the same approvals required for the gate.

## Results template

| Item | Approved target | Observed result | Evidence link | Pass/fail | Owner |
|---|---:|---:|---|---|---|
| Transactions/participants | Gate-specific, statistically justified before execution | — | — | — | Project owner |
| Credential success/replay | ≥99.5% supported reads; zero replay acceptance | — | — | — | Security/hardware owner |
| Decision latency p50/p95/p99 | ≤1.0s / ≤2.0s / ≤3.0s excluding interaction | — | — | — | Product/SRE |
| False match/non-match/acquisition | FMR ≤1:10,000; FNMR <5%; acquisition reported separately | — | — | — | Biometric owner |
| PAD attack/bona fide performance | IAPAR <0.07 plus declared attack coverage | — | — | — | Security/biometric owner |
| Cohort/environment bounds | No approved cohort outside accepted bounds | — | — | — | Privacy/biometric owner |
| Revocation online/offline | ≤60s online; offline allow disabled initially | — | — | — | Security owner |
| Controller/door mismatch | 0 unexplained | — | — | — | Integrator |
| Missing/duplicate audit events | 0 unexplained | — | — | — | Security/SRE |
| Fallback/accessibility | 100% of participants retain a usable alternative | — | — | — | Product/accessibility owner |
| Incidents and stop conditions | 0 unresolved | — | — | — | Pilot owner |
