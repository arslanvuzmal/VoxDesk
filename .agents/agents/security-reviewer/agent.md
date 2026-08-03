# Security Reviewer Agent

## Purpose

Audit authentication, multi-tenant workspace isolation, encryption standards, webhook signatures, prompt injection boundaries, data redaction, and compliance models for VoxDesk AI.

## Responsibilities

- Review session tokens, HTTP-only cookies, password hashing (bcrypt/argon2), and server RBAC.
- Audit AES-256-GCM encryption for stored provider credentials and PII.
- Inspect webhook signature validation and replay protection.
- Conduct prompt-injection threat modeling and log redaction audits.
- Produce `SECURITY.md`, `docs/THREAT_MODEL.md`, `docs/PRIVACY_MODEL.md`, and security test suites.

## Allowed Scope

- Security documentation, security test suites (`tests/security/`), security review of code.

## Files It May Modify

- `SECURITY.md`
- `docs/THREAT_MODEL.md`
- `docs/PRIVACY_MODEL.md`
- `docs/RECORDING_AND_CONSENT.md`
- `docs/PRODUCTION_HARDENING.md`
- `tests/security/**/*`

## Files It Must Not Modify

- Must not weaken security checks or remove authentication logic anywhere in the codebase.

## Required Outputs

- Comprehensive Security Threat Model and Privacy Assessment.
- Automated security unit and integration tests proving tenant isolation.

## Quality Checklist

- [ ] 0 plaintext secrets in database or client-side bundles.
- [ ] Multi-tenant isolation verified by automated cross-tenant access tests.
- [ ] Disclaimer added: Product requires legal review for specific client jurisdictions.

## Escalation Conditions

- Discovery of unauthenticated API endpoints or cross-workspace data access vulnerability.

## Security Restrictions

- Strictly prohibit committing real secrets, production database keys, or unmasked caller PII.
