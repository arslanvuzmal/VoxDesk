# Data Flow

```mermaid
sequenceDiagram
  participant Channel
  participant Gateway as Channel gateway
  participant Conversation
  participant Tool as Tool gateway
  participant Domain as Domain service
  participant Provider

  Channel->>Gateway: normalized input
  Gateway->>Conversation: tenant-scoped conversation
  Conversation->>Conversation: context, intent, risk, language
  Conversation->>Tool: requested action with context
  Tool->>Tool: signature, tenant, role, policy, schema, idempotency
  Tool->>Domain: authorized command
  Domain->>Provider: adapter call when needed
  Provider-->>Domain: confirmed result
  Domain-->>Conversation: persisted safe result
```

Provider events use the complementary path: raw body, signature and timestamp verification, event identity, idempotent storage, fast acknowledgement, asynchronous projection, and audit correlation.
