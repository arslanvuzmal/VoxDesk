# Provider Boundaries

| Boundary             | Owner                                                      | VoxDesk responsibility                                             |
| -------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------ |
| ElevenLabs           | Realtime speech, turns, agent session, post-call output    | Scope agent configuration, authorize tools, reconcile results      |
| Telnyx               | PSTN, SIP, call control, transfer primitives, voice events | Route verified events, correlate calls, apply policy and CRM state |
| Calendar adapters    | Availability and external events                           | Apply booking rules, idempotency, and persist confirmation         |
| CRM adapters         | External synchronization                                   | Keep VoxDesk operational state canonical and sync safely outward   |
| PostgreSQL and Redis | Storage, leases, quotas                                    | Tenant scope, migration discipline, retry and failure handling     |

Routes should call services and provider interfaces rather than embedding provider HTTP behavior in UI components or client code.
