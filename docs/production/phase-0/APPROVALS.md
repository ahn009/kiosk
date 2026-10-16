# Phase 0 completion and authority record

Status: approved for Phase 1 non-actuating software engineering

Approval date: 2026-10-16

Authority: the project owner explicitly granted full authority to complete Phase 0.

## Scope approved

- Build a production-shaped, multi-site software architecture.
- Use a laptop camera, virtual QR credential, synthetic identities, and voluntary developer face data for initial development.
- Process real camera frames; prohibit generated biometric evidence and invented performance claims.
- Use a controller adapter that is technically incapable of physical actuation.
- Keep hardware, biometric vendor, cloud provider, organization, site, and jurisdiction replaceable and undecided until evidence exists.
- Proceed into Phase 1 engineering under the requirements, risks, ADRs, and measurable targets in this package.

## Current accountability

| Responsibility | Accountable party | Phase 0 disposition |
|---|---|---|
| Business/product and risk authority | Project owner | Accepted for the non-actuating development scope |
| Engineering/platform | Project owner | Accepted; implemented through phased quality gates |
| Security architecture | Project owner, pending independent review | Initial baseline accepted; independent review required before external pilot |
| Privacy/legal | Not yet applicable to an organization/site | Mandatory reopening gate before real-person organizational use |
| HR/employee relations | Not applicable to synthetic/developer testing | Mandatory reopening gate before worker use |
| Accessibility | Project owner during development | WCAG 2.2 AA design target; representative review required before pilot |
| Facilities/life safety | Not applicable without a door | Mandatory reopening gate before controller/door connection |
| Physical-security integrator | Not selected | Mandatory reopening gate before hardware selection/actuation |
| Operations/SRE | Project owner during development | Production ownership required before hosted pilot |
| Security operations/incident response | Project owner during development | Production coverage required before hosted pilot |

## Exit evidence

- [x] The no-live-door rule is accepted and represented by a non-actuating controller contract.
- [x] The current environment is recorded: personal development, laptop camera, virtual QR, synthetic identities, no PACS/controller/door.
- [x] Product scope and initial measurable security, biometric, accessibility, operational, and recovery targets are recorded.
- [x] Current and target data flows, trust boundaries, data inventory, retention principles, and recipients are documented.
- [x] Privacy/legal review is classified as not applicable to the present synthetic/non-actuating scope and as a mandatory reopening trigger.
- [x] Fire, egress, REX, power, emergency, and manual-access review is classified as a mandatory pre-hardware gate.
- [x] The initial technical threat model records critical/high risks, treatments, phase gates, and the rule that critical risks cannot be accepted for a live-door pilot.
- [x] ADR-001 through ADR-006 establish the software architecture and explicitly defer evidence-dependent vendor/site choices.
- [x] Hardware selection criteria and the laboratory acceptance process are documented; buying hardware is not required for Phase 1.
- [x] Pilot stages, evidence, fallback, support expectations, and mandatory stop conditions are documented.
- [x] Phase 1 work traces directly to the requirements and risk register.
- [x] No unresolved critical risk is accepted for real-person organizational use or a live door.

## Approval record

| Area | Decision | Approver | Date | Evidence/reference |
|---|---|---|---|---|
| Business/product | Approve Phase 1 software engineering | Project owner | 2026-10-16 | Explicit full-authority instruction |
| Security architecture | Accept initial baseline, not production assurance | Project owner | 2026-10-16 | [Threat model](THREAT-MODEL.md) and [decisions](DECISIONS.md) |
| Privacy/legal | Defer until a triggering use/site/jurisdiction exists | Project owner | 2026-10-16 | Reopening triggers below |
| Facilities/life safety | Defer because no hardware/door is in scope | Project owner | 2026-10-16 | Non-actuating development profile |
| Engineering/operations | Proceed with Phase 1 quality gates after this baseline is published | Project owner | 2026-10-16 | [Production roadmap](../../PRODUCTION_ROADMAP.md) |

## Mandatory Phase 0 reopening triggers

This completion is invalid for the new scope until Phase 0 is reopened when any of these occurs:

1. A production organization, customer, worker population, country, region, or site is selected.
2. Anyone other than the developer participates with real identity or biometric data.
3. Biometric data is retained, transferred to a third party, or used beyond immediate voluntary development testing.
4. A cloud, biometric/PAD provider, credential/card, reader, production camera, PACS, access-control unit, lock, or door is selected.
5. Offline allow behavior is proposed.
6. The software can request or cause physical actuation.
7. Results may affect access, attendance, employment, discipline, safety, or legal rights.
8. The threat model, data flow, target assurance, or deployment purpose materially changes.

Reopening requires the specialist approvals appropriate to the new scope. Project-owner authority cannot substitute for legal, biometric validation, accessibility, physical-security, or life-safety evidence.

Phase 0 is complete for Phase 1 software engineering. It does not authorize a real-world pilot, production processing, or live-door operation.
