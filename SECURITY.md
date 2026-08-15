# Security Policy

VoxDesk processes tenant-scoped customer operations data and integrates with voice providers. Security reports are handled privately.

## Reporting a vulnerability

Do **not** open a public issue for a suspected vulnerability. Use [GitHub private vulnerability reporting](https://github.com/arslanvuzmal/VoxDesk/security/advisories/new) and include:

- affected commit, route, or deployment URL
- reproduction steps and impact
- a minimal proof of concept
- whether customer, provider, or tenant data could be exposed
- any suggested mitigation

Do not include real customer data, access tokens, passwords, API keys, or full phone numbers.

## Scope

High-priority concerns include tenant isolation, authentication, authorization, signed conversation contexts, webhook verification, replay protection, SSRF, provider credentials, campaign controls, recording consent, and PII leakage.

## Response principles

The maintainer will acknowledge a private report, assess reproducibility and impact, coordinate remediation, and publish a disclosure only after a fix is available. No response time or bounty is promised.

## Supported code

Security fixes are assessed against the current `main` branch and the active production code. Historical demo-only or retired routes may be removed rather than patched when that is safer.
