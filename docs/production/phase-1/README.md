# Phase 1 engineering foundation

Status: in progress

Started: 2026-10-16

This phase builds the production-shaped software foundation before real hardware or a cloud provider is selected.

## Current checkpoint

- [x] Restore TypeScript as a blocking production-build check.
- [x] Enable React strict mode.
- [x] Add explicit deployment stage and demo-mode configuration.
- [x] Default demo mode off and reject it in the production stage.
- [x] Server-gate credential/status/scan simulation routes.
- [x] Hide the fixed demonstration supervisor override outside demo mode.
- [x] Define vendor-neutral credential, camera, biometric, policy, controller, and event contracts.
- [x] Add a non-actuating development controller implementation.
- [x] Remove unverified performance, encryption, immutability, offline, database, and model claims from the launcher.
- [x] Add `typecheck` and aggregate `check` package scripts.
- [x] Pin Node 24/npm and add an exact npm lockfile for the main application.
- [x] Add continuous integration and verify `npm ci` from an empty directory.
- [ ] Add unit, integration, API authorization, and production-artifact tests. Initial configuration/controller unit tests pass; broader coverage remains open.
- [ ] Replace demo routes/components with real virtual-credential and camera adapters, then delete simulator code.
- [ ] Add schema-validated server configuration for every required production dependency and secret.
- [ ] Add global error/not-found behavior and production security headers/CSP.
- [ ] Establish the server-only data-access and authorization boundary.
- [ ] Produce environment-neutral deployment artifacts and rollback procedure.
- [ ] Remediate the production dependency audit: currently 5 high and 4 moderate advisories (`npm audit --omit=dev`).

## Rules established by this checkpoint

1. `DEPLOYMENT_STAGE` is one of `development`, `test`, `staging`, or `production`.
2. `DEMO_MODE` defaults to `false`.
3. Enabling `DEMO_MODE` in the production stage is a startup/build configuration error.
4. Demo UI is never an authorization control; demo API routes enforce the flag on the server.
5. The development controller always returns `actuated: false` and cannot operate hardware.
6. External hardware and vendors implement contracts; they do not own access policy.

## Verification commands

```bash
npm ci
npm run check
```

The production build must pass without `typescript.ignoreBuildErrors`.

## Verification evidence

- Clean install: 849 packages installed successfully from `package-lock.json` in an empty temporary directory.
- Unit tests: 6 passed, 0 failed.
- TypeScript: passed with no emit.
- ESLint on changed production/test files: passed.
- Production-stage Next.js build: passed with demo mode disabled.
- Dependency audit: failed the release target with 5 high and 4 moderate production advisories; remediation is required before Phase 1 completion.
