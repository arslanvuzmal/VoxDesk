# ADR-0002: ElevenLabs as Conversational Layer

**Status:** Accepted

**Context:** Realtime turn-taking, speech, agent interaction, and post-call output require one primary conversation provider.

**Decision:** ElevenLabs is the canonical conversational layer.

**Alternatives:** Building a second simultaneous voice-agent stack.

**Consequences:** VoxDesk keeps business context, authorization, and persistence; provider output is reconciled rather than trusted for business side effects.
**Security/operations:** Tool requests cross the VoxDesk authorization boundary.
