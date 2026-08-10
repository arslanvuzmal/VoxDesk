# Platform overview

VoxDesk is a conversation operating system. Website voice, inbound phone, approved outbound phone, and web text enter one canonical Conversation domain.

## Ownership

- ElevenLabs owns realtime speech, turns, voice, agent sessions, specialist transfers, provider conversation IDs, and post-call output.
- Telnyx owns PSTN numbers, SIP transport, caller ID, call-control events, telephony failures, and telephone transfer primitives.
- VoxDesk owns tenants, business policy, consent, campaigns, CRM, tools, persistence, reconciliation, evaluation, audit, and supervised deployment.

## Data flow

A channel creates or resolves a Conversation and optional Call. The orchestrator loads an immutable training-pack version and verified language. Tool requests cross a signed server authorization boundary. Provider events reconcile into the same record. Finalization normalizes messages, fields, tools, outcome, completeness, follow-up, and evaluation.

Webhook acknowledgment is separated from mutation through ProviderEvent and BackgroundJob records. Correlation IDs connect every request, provider identifier, call, conversation, campaign, and attempt.
