# Security Policy

## Supported version

Security updates are applied to the latest commit on `main`.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub's private vulnerability reporting feature for this repository and include:

- A clear description of the issue and its impact
- Reproduction steps or a minimal proof of concept
- Affected routes, roles, or deployment modes
- Any suggested mitigation

Avoid accessing data that is not yours, disrupting a deployed system, or retaining card tokens, credentials, face data, or audit records. Maintainers should acknowledge a complete report within seven days and coordinate disclosure after a fix is available.

## Production requirements

Before deployment, replace all demonstration secrets and credentials, remove fixed supervisor access paths, use durable session storage, secure service-to-service endpoints, restrict webhook destinations, and complete an independent review of biometric consent, retention, encryption, and applicable privacy requirements.
