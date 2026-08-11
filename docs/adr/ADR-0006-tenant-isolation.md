# ADR-0006: Tenant Isolation Strategy

**Status:** Accepted

**Context:** Customer operations records contain sensitive, workspace-owned data.

**Decision:** Resolve session -> membership -> role -> workspace before resource access; resource IDs alone never authorize.

**Alternatives:** UI-only workspace filtering.

**Consequences:** Every query/service must preserve workspace scope.
**Security/operations:** Cross-tenant tests verify non-disclosing failure behavior.
