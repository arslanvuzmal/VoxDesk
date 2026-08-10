# Conversation model

Conversation is the canonical record across PHONE, WEB_VOICE, and WEB_TEXT. Direction is INBOUND, OUTBOUND, or INTERACTIVE. A phone conversation may reference Call; web channels never pretend to be PSTN calls.

ConversationMessage stores ordered customer, agent, human, system, transcript, tool, and event turns. ConversationField stores safe or encrypted structured values with source, confidence, and verification. ConversationToolExecution records authorized attempts without secrets. ConversationProviderCorrelation maps Telnyx and ElevenLabs identifiers.

ConversationState carries workflow state independently of transcript prose. Every conversation stores the actual agent version, training-pack version, language profile, correlation ID, completeness status, and review requirement.

## Migration rule

Call records are backfilled additively. During migration, projections may dual-write behind an explicit feature flag. Missing values remain missing and display as Not provided, Not available, or Provider data pending.
