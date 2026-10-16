# Phase 0 control file

Status: complete — 100% for the current non-actuating software scope

Started: 2026-10-16

Owner: project owner

Phase 0 defines what SentinelKiosk may safely do before production implementation begins. It does not authorize use on a live door.

## Safety rule

The current application may be used for software demonstrations and isolated laboratory testing only. It must not actuate a production lock or make an employment, attendance, or disciplinary decision.

## Work products

| Artifact | Purpose | Status |
|---|---|---|
| [Initial development profile](DEVELOPMENT-PROFILE.md) | Enterprise target with laptop/webcam/virtual-card reference adapters | Accepted project direction |
| [Requirements baseline](REQUIREMENTS.md) | Scope, constraints, measurable requirements, and open facts | Accepted for software build |
| [System context and data flow](SYSTEM-CONTEXT.md) | Current and target boundaries, stores, and data classes | Accepted baseline |
| [Threat model and risk register](THREAT-MODEL.md) | Abuse cases, controls, owners, and stop conditions | Accepted initial register |
| [Decision register](DECISIONS.md) | ADR candidates and the exact choices required | Software architecture accepted |
| [Pilot protocol](PILOT-PROTOCOL.md) | Bench, shadow, controlled-door, and limited rollout gates | Protocol accepted; execution deferred |
| [Hardware laboratory plan](HARDWARE-LAB.md) | Procurement evidence and repeatable acceptance tests | Protocol accepted; hardware deferred |
| [Approvals and exit gate](APPROVALS.md) | Named sign-offs and Phase 0 completion evidence | Approved for Phase 1 |

## Phase 0 work board

| ID | Work item | Accountable role | State | Evidence |
|---|---|---|---|---|
| P0-001 | Assign owner and approve the no-live-door rule | Project owner | Complete | [Approval record](APPROVALS.md) |
| P0-002 | Inventory the initial environment | Project owner | Complete for laptop reference environment; production inventory is a reopening trigger | [Development profile](DEVELOPMENT-PROFILE.md) |
| P0-003 | Scope jurisdiction/privacy/life-safety review | Project owner | Complete: not applicable to synthetic, non-actuating development; mandatory before real-person/site use | [Approval record](APPROVALS.md) |
| P0-004 | Establish threat model and treatments | Project owner | Complete as initial technical baseline; independent review required before pilot | [Risk register](THREAT-MODEL.md) |
| P0-005 | Decide software architecture | Project owner | Complete; vendor/site choices deliberately remain adapters | [Decision register](DECISIONS.md) |
| P0-006 | Define pilot gates, measures, data rules, and stop conditions | Project owner | Complete as protocol; no pilot is authorized | [Pilot protocol](PILOT-PROTOCOL.md) |
| P0-007 | Define hardware selection and lab process | Project owner | Complete as procurement/test protocol; selection occurs when hardware is obtained | [Hardware plan](HARDWARE-LAB.md) |

## Required participants

- executive or product owner with risk acceptance authority;
- engineering and platform leads;
- application/device security lead;
- privacy/legal and HR or employee-relations representatives;
- accessibility representative;
- facilities, fire/egress, and physical-security integrator;
- operations/SRE, service desk, and security operations;
- biometric and hardware vendors when their implementation is in scope.

## Working sequence

1. Use the accepted `DEVELOPMENT-PROFILE.md` for initial engineering and fill the remaining production/site facts in `REQUIREMENTS.md`.
2. Confirm the current/target diagrams in `SYSTEM-CONTEXT.md`.
3. Conduct the threat-model workshop using `THREAT-MODEL.md`.
4. Accept or replace every proposed choice in `DECISIONS.md`.
5. Select hardware and execute the non-actuating lab plan.
6. Approve the pilot protocol, support model, privacy material, and stop authority.
7. Complete every item in `APPROVALS.md`; then update this file to `complete`.

## Reopening triggers

Phase 0 automatically reopens before any of the following:

- using a real person other than voluntary developer testing;
- retaining real biometric data beyond the immediate development test;
- choosing a deployment country, employer, customer, site, cloud, biometric vendor, credential vendor, reader, camera, PACS, controller, or door;
- enabling offline access or connecting any physical actuator;
- using results for access, attendance, employment, safety, or disciplinary purposes;
- materially changing the threat model, data flow, or assurance targets.

Completion authorizes Phase 1 software engineering only. It does not authorize a real-person pilot or live-door operation.
