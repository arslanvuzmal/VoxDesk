# Tenant Isolation

Every telephony event, concurrent lease, campaign, agent version, and improvement proposal uses `workspaceId` for isolation.

No cross-tenant data leakage is permitted in logs, analytics, or concurrent processing. The `Workspace` model enforces isolation for all related entities.

Concurrent call management uses scope-based isolation (`scopeType`, `scopeId`) with workspace-level constraints.
