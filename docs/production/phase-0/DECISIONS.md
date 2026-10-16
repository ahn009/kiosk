# Phase 0 architecture decision register

Status: software architecture accepted; deployment-specific selections deferred by design

Each decision must record the selected option, reasons, rejected alternatives, security/privacy/safety consequences, owner, approvers, and approval date. Proposed directions below are starting points, not approvals.

The [initial development profile](DEVELOPMENT-PROFILE.md) is decided: laptop camera, virtual QR test credential, real frame-based face verification, a non-actuating controller adapter, and local development. These choices are reference adapters and do not settle the production hardware or cloud decisions below.

## ADR-001 — credential technology

Decision required: what real credential will be issued/read, and what existing corporate credential must interoperate?

Options to evaluate:

- existing PACS smart card/mobile credential through the approved controller ecosystem;
- cryptographic NFC smart card with mutual authentication;
- PIV/CAC where mandated;
- dynamic mobile QR/NFC credential;
- static printed QR only for explicitly low-risk/test use with an additional approved factor.

Proposed direction: reuse an approved enterprise/PACS credential when it satisfies the threat model; otherwise pilot cryptographic smart card or dynamic mobile credential. Do not use UID-only or long-lived static bearer values for medium/high-risk access.

Evidence required: card/reader/controller compatibility, credential cryptography and key custody, cloning/replay analysis, issuance/revocation lifecycle, accessibility, throughput, vendor lifecycle, offline behavior, and total cost.

Owner: project owner. Status: accepted for software architecture; production credential selection is a reopening trigger.

Development decision: use a short-lived virtual QR test credential rendered locally and presented on a phone or second screen to the laptop camera. This is accepted for the non-actuating development profile only; production credential selection remains proposed.

## ADR-002 — biometric necessity and verification topology

Decision required: is face verification necessary; if so, where do capture, PAD, template generation, and matching run?

Options: no biometric; on-device; on-premises service; approved cloud service; hybrid.

Proposed direction: do not enable biometrics until necessity/proportionality and jurisdiction review pass. Prefer processing that minimizes raw-frame movement and retention. Pair biometrics with a physical authenticator and provide a non-biometric alternative.

Evidence required: lawful basis/authority, DPIA or equivalent, vendor/model/PAD evidence, data residency, sub-processors, security architecture, representative performance, deletion/export, update behavior, outage behavior, and fallback.

Owner: project owner. Status: accepted for software architecture; provider and production validation are reopening triggers.

Development decision: face verification is a core feature. Use actual laptop-camera frames behind replaceable capture and verification interfaces. Provider/topology and production PAD remain proposed; generated embeddings and fabricated scores are not acceptable development substitutes.

## ADR-003 — PACS/controller integration and door authority

Decision required: which existing PACS/ACU owns the final unlock and which secure reader/controller protocol is supported?

Options: PACS API integration; access-control panel input/integration module; OSDP Secure Channel with verified compatible components; vendor-specific authenticated integration.

Proposed direction: keep the certified access-control unit authoritative and integrate through its supported authenticated interface. Prefer OSDP Secure Channel over legacy unsupervised Wiegand when hardware supports it. The web application must not drive a lock relay directly.

Evidence required: controller/reader models and firmware, protocol/security profile, supervision/tamper behavior, fire/egress design, command acknowledgement/door contact, integrator support, certification, and witnessed failure tests.

Owner: project owner. Status: accepted for software architecture; PACS/ACU selection is a reopening trigger.

Development decision: use a non-actuating controller adapter that implements the future command/acknowledgement contract but cannot connect to a lock. Production PACS/ACU selection remains proposed.

## ADR-004 — offline policy

Decision required: may a kiosk unlock while disconnected, for which doors/populations, and for how long?

Options: deny access offline; controller/PACS-owned cached policy; kiosk-owned signed short-lived policy; hybrid by door classification.

Proposed direction: default deny for SentinelKiosk-dependent decisions until a site-specific rule is approved. Prefer the established controller/PACS offline capability. If kiosk decisions are unavoidable, use signed expiring policy/revocation bundles, protected local keys/storage, trusted time, strict maximum age, durable event reconciliation, and immediate stale-state indication.

Evidence required: outage history, business impact, door classification, revocation target, clock assurance, device protection, life-safety behavior, recovery procedure, and partition tests.

Owner: project owner. Status: accepted with offline allow disabled; enabling it is a reopening trigger.

## ADR-005 — workforce and administrator identity

Decision required: what system is authoritative for workers, and what IdP/authentication level protects administration and employee self-service?

Proposed direction: synchronize joiner/mover/leaver state from the approved HR/identity source; use organizational OIDC/SAML for people, strong MFA for privileged roles, durable revocable sessions, and unique device identity for kiosks. Employee code alone is not authentication.

Evidence required: IdP/HR integration, assurance level, account recovery, contractors/visitors, termination SLA, role mapping, break-glass control, session/device revocation, and audit.

Owner: project owner. Status: accepted target architecture; organization IdP selection is a reopening trigger.

## ADR-006 — production data platform and key custody

Decision required: approved relational database, session/cache, queue/event, object/template storage, KMS/HSM, backup, and regional topology.

Proposed direction: managed PostgreSQL plus durable session/event services and KMS-backed envelope encryption, separated by environment. Do not package the mutable production database or store secrets in local JSON.

Evidence required: tenant isolation, encryption, availability, RTO/RPO, restore test, key rotation/deletion, regional requirements, audit access, cost, and operating ownership.

Owner: project owner. Status: accepted target architecture; cloud/provider selection is a reopening trigger.

Development decision: keep the application cloud-portable and provider-neutral until workload, region, cost, and compliance needs are known. Local development must not introduce assumptions that prevent later managed cloud deployment.

## Decision record

| ADR | Selected option | Owner | Security | Privacy/legal | Facilities/life safety | Product | Date |
|---|---|---|---|---|---|---|---|
| ADR-001 | Virtual short-lived QR reference adapter; production credential remains replaceable | Project owner | Accepted baseline | Deployment review required | Hardware review required | Accepted | 2026-10-16 |
| ADR-002 | Real-frame face verification behind provider-neutral interface; no fake evidence | Project owner | Accepted baseline | Deployment review required | N/A | Accepted | 2026-10-16 |
| ADR-003 | Non-actuating development adapter; production ACU remains authoritative | Project owner | Accepted baseline | N/A | Deployment review required | Accepted | 2026-10-16 |
| ADR-004 | No offline allow in initial profile; fail closed | Project owner | Accepted baseline | Deployment review required | Deployment review required | Accepted | 2026-10-16 |
| ADR-005 | Organization IdP/MFA target; development identity isolated and non-production | Project owner | Accepted baseline | Deployment review required | N/A | Accepted | 2026-10-16 |
| ADR-006 | Cloud-neutral modular architecture; managed PostgreSQL/KMS/durable event target | Project owner | Accepted baseline | Deployment review required | N/A | Accepted | 2026-10-16 |
