# ADR-0007: Supervised Improvement

**Status:** Accepted

**Context:** Conversation quality should improve without autonomous production prompt/config mutation.

**Decision:** Observation -> proposal -> human approval -> candidate -> evaluation -> canary -> promotion/rollback.

**Alternatives:** Self-modifying production agents.

**Consequences:** Improvement is slower but auditable and reversible.
**Security/operations:** Promotion and rollback are permissioned state transitions with evidence.
