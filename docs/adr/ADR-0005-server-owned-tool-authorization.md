# ADR-0005: Server-Owned Tool Authorization

**Status:** Accepted

**Context:** An LLM/browser must not gain authority from supplied identifiers or prose.

**Decision:** Tools require signed conversation context, schema validation, tenant/role/policy checks, and idempotency before a domain service executes.

**Alternatives:** Direct model-to-provider/database calls.

**Consequences:** More explicit service boundaries and audit records.
**Security/operations:** Retries return persisted outcomes when appropriate and avoid duplicate side effects.
