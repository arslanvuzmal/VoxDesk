# Telephony architecture

ElevenLabs is VoxDesk's conversational intelligence layer. Telnyx is VoxDesk's
production PSTN and SIP provider. VoxDesk owns the normalized call lifecycle,
authorization, CRM persistence, campaign controls, compliance checks, and audit history.

## Production call architecture

```mermaid
flowchart TD
  Caller[Customer phone] <--> Telnyx[Telnyx PSTN / SIP]
  Telnyx <--> ElevenLabs[ElevenLabs conversational agent]
  ElevenLabs <--> Gateway[VoxDesk voice-agent gateway]
  Gateway --> Tools[Authorized tools]
  Tools --> CRM[CRM / Calendar / PostgreSQL]
  Telnyx --> Webhook[Verified Telnyx webhook]
  Webhook --> Events[Provider event inbox]
  Events --> State[Call state machine]
  State --> CRM
```

## Portfolio simulation architecture

```mermaid
flowchart TD
  Viewer[Authorized dashboard user] --> Simulator[VoxDesk simulation provider]
  Simulator --> Events[Normalized simulated events]
  Events --> State[Same call state machine]
  State --> Tools[Same authorized CRM tools]
  Tools --> CRM[CRM / Calendar / PostgreSQL]
```

The simulator never calls Telnyx, ElevenLabs SIP, or the public Telnyx webhook.
Simulated records use provider `SIMULATION`, execution mode `SIMULATION`, and
clearly-prefixed `sim_…` identifiers.

## Inbound production sequence

```mermaid
sequenceDiagram
  participant C as Caller
  participant T as Telnyx
  participant E as ElevenLabs
  participant V as VoxDesk
  C->>T: PSTN call
  T->>V: Signed provider event
  V-->>T: Prompt acknowledgement
  T->>E: SIP agent session
  E->>V: Authorized tool request
  V->>V: Tenant policy + CRM tool execution
  E->>V: Signed post-call event
  V->>V: Reconcile Conversation and Call
```

## Outbound production sequence

```mermaid
sequenceDiagram
  participant V as VoxDesk
  participant E as ElevenLabs SIP
  participant T as Telnyx
  participant C as Customer
  V->>V: Consent, suppression, window and capacity checks
  V->>E: Start verified SIP outbound call
  E->>T: SIP / PSTN transport
  T->>C: Call
  T->>V: Signed call events
  E->>V: Signed post-call event
```

## Readiness state machine

```mermaid
stateDiagram-v2
  [*] --> SIMULATION_READY: simulation mode + database
  [*] --> PROVIDER_CONFIGURED: Telnyx key + connection
  PROVIDER_CONFIGURED --> LIVE_READY: number, webhook, profile, ElevenLabs and database verified
  LIVE_READY --> PROVIDER_CONFIGURED: required resource removed
```

See [the client activation guide](../guides/activate-live-telephony.md) for the
live onboarding and rollback procedure.

## Provider event lifecycle

```mermaid
flowchart LR
  Event[Telnyx signed event] --> Verify[Raw-body signature and timestamp verification]
  Verify --> Inbox[Idempotent ProviderEvent inbox]
  Inbox --> Ack[2xx acknowledgement]
  Inbox --> Worker[Background processing]
  Worker --> Project[Call and Conversation projection]
  Project --> Audit[Audit / analytics]
```

Simulation bypasses this public provider path entirely. Its events are created by
the authenticated internal simulation service and are marked `SIMULATION`.

## ElevenLabs tool authorization

```mermaid
flowchart LR
  Agent[ElevenLabs agent] --> Request[Tool request]
  Request --> Context[Signed short-lived ConversationContext]
  Context --> Policy[Workspace, role and business-policy check]
  Policy --> Idempotency[Operation fingerprint]
  Idempotency --> Tool[Server-owned CRM or calendar action]
  Tool --> Record[Conversation tool execution + safe result]
  Record --> Agent
```
