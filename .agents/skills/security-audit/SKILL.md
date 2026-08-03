---
name: security-audit
description: Audits multi-tenant isolation, session security, encryption standards, webhook signatures, and secret protection for VoxDesk AI.
---

# Security Audit Skill

## When to Use
Use prior to git commits, release builds, or major feature completions to verify zero security vulnerabilities or privacy leaks exist.

## Inputs Required
- Application source tree.
- Database query endpoints.
- Webhook signature handlers.

## Step-by-Step Process
1. Scan codebase for hardcoded secrets, API tokens, or private keys.
2. Verify all API routes validate session authentication and enforce tenant `workspaceId` checks.
3. Test RBAC permissions (Owner, Admin, Operator, Analyst, Viewer).
4. Verify AES-256-GCM encryption for credentials at rest.
5. Check webhook signature verification logic (Twilio, Vapi, Retell).
6. Verify log redaction for PII and phone numbers.

## Decision Tree
- **Is an API route missing workspace verification?**
  - YES -> BLOCK RELEASE -> Add server-side workspace permission check.
  - NO -> Continue audit checklist.

## Validation Checklist
- [ ] 0 unmasked secrets in database or client JS bundles.
- [ ] RBAC tests pass with 100% tenant separation.
- [ ] Webhook handlers reject unsigned or replayed payloads.

## Failure Conditions
- Hardcoded API keys or cross-tenant data access.

## Expected Output
Security findings report and automated security test confirmation.
