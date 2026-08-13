# Tool authorization

The model cannot directly write to the CRM, calendar, or operational records.

```mermaid
flowchart TD
  Agent[ElevenLabs agent or channel adapter] --> Request[Tool request]
  Request --> Context[Signed conversation context]
  Context --> Gateway[VoxDesk tool gateway]
  Gateway --> Checks[Schema, tenant, role, workflow, and policy checks]
  Checks --> Idempotency[Idempotency check]
  Idempotency --> Service[Domain service or provider adapter]
  Service --> Audit[Persist safe execution and audit result]
  Audit --> Agent
```

The signed, short-lived `ConversationContext` includes conversation, workspace, business, optional contact, agent/version, training-pack version, channel, direction, language, issue time, and expiry.

VoxDesk resolves the conversation and tenant a second time before action.

Every tool request is schema-validated. Side-effecting tools require an execution ID and operation fingerprint so a provider retry returns the original result instead of creating duplicates.

The result stored for the agent is safe and minimal; credentials and unrestricted customer data are never returned.

Browser or model values never establish workspace, business, contact, agent, or authority.

Forged, expired, cross-tenant, or policy-blocked requests are rejected and tested as security cases.


## Policy decisions

The gateway evaluates a request after resolving the persisted conversation and before executing a side effect:

- `ALLOW` permits the validated domain action.
- `DENY` rejects a repeated consequential action or another policy violation.
- `ESCALATE` records a blocked execution and requires human approval; it does not dispatch the action.

Policy inspection includes nested payload keys for sensitive data and external communication destinations.

The audit metadata stores the decision, risk score, policy codes, reason, and a one-way policy fingerprint without storing the sensitive value.

Idempotency is separate from authorization. The operation fingerprint is derived from the tool name and a stable payload fingerprint.

A retry with the same conversation, tool, and payload returns the persisted successful result; a different payload cannot reuse that operation identity.
