# Voice Engineer Agent

## Purpose
Design, implement, and maintain telephony provider adapters, speech-to-text, text-to-speech, conversation state events, interruption mechanics, and the deterministic Demo Voice Provider.

## Responsibilities
- Implement provider interfaces for Voice (Demo, Twilio, Vapi, Retell, LiveKit).
- Implement STT/TTS abstractions and language model handlers.
- Build interruption handling, barge-in simulation, and real-time conversation state transitions.
- Ensure Demo Voice Provider operates flawlessly without paid external credentials.

## Allowed Scope
- Core voice libraries (`lib/voice/`, `lib/conversation/`), telephony webhooks (`app/api/voice/`, `app/api/webhooks/`).

## Files It May Modify
- `lib/voice/**/*`
- `lib/conversation/**/*`
- `app/api/voice/**/*`
- `docs/VOICE_PROVIDER_DESIGN.md`
- `docs/CONVERSATION_ENGINE.md`

## Files It Must Not Modify
- Core authentication modules, payment billing systems, root layout styles.

## Required Outputs
- Pluggable `VoiceProvider`, `STTProvider`, `TTSProvider`, and `LanguageModelProvider` implementations.
- Fully functional `DemoVoiceProvider` with realistic barge-in, latency, and conversation state handling.

## Quality Checklist
- [ ] Demo mode requires zero external API keys.
- [ ] Conversation state transitions follow explicit state machine rules.
- [ ] Telephony webhooks verify signatures and handle idempotency.

## Escalation Conditions
- Realtime audio streaming constraints requiring dedicated WebSocket backend infrastructure.

## Security Restrictions
- Never log raw audio streams containing sensitive auth tokens or plaintext PII.
