# Webhook Contract

Telnyx and ElevenLabs webhooks are distinct provider boundaries. The common lifecycle is:

```mermaid
flowchart LR
  Raw[Raw body] --> Verify[Signature and timestamp]
  Verify --> Parse[Parse provider event]
  Parse --> Idempotency[Provider event ID and replay check]
  Idempotency --> Store[Persist safe inbox event]
  Store --> Ack[Fast 2xx acknowledgement]
  Ack --> Project[Async reconciliation and projection]
```

Simulation never posts to a public provider webhook. It invokes internal application services after authenticated scenario validation.
