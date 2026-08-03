# VoxDesk AI — Voice AI Research Notes

**Author / Owner:** Arslan Vuzmal Lone  
**Date:** 2026-08-03  
**Status:** Complete

---

## 1. Executive Summary

This research document analyzes current production state-of-the-art Voice AI platforms, telephony backends, speech recognition engines, text-to-speech models, calendar booking standards, and CRM architectures to inform the engineering design of **VoxDesk AI**.

---

## 2. Voice & Telephony Provider Benchmarks

| Provider / Technology | Architecture / Transport | Latency Profile  | Key Capabilities                                                      | VoxDesk Adapter Pattern | Licensing & Usage          |
| :-------------------- | :----------------------- | :--------------- | :-------------------------------------------------------------------- | :---------------------- | :------------------------- |
| **Vapi AI**           | WebSocket / REST         | ~600ms - 900ms   | Real-time voice agent orchestration, tool calling, assistant webhooks | `VapiVoiceProvider`     | Commercial API             |
| **Retell AI**         | WebSocket / REST         | ~500ms - 800ms   | Conversational state management, custom LLM webhooks, low latency     | `RetellVoiceProvider`   | Commercial API             |
| **Twilio Voice**      | TwiML / Media Streams    | ~200ms transport | PSTN SIP trunking, call routing, phone number provisioning            | `TwilioVoiceProvider`   | Commercial Telecom API     |
| **LiveKit Agents**    | WebRTC / WebSocket       | ~300ms - 500ms   | Low-latency WebRTC media streams, python/node agent framework         | `LiveKitVoiceProvider`  | Apache 2.0 / Managed Cloud |
| **Deepgram**          | WebSocket / REST         | ~150ms - 300ms   | Nova-3 real-time speech-to-text, speaker diarization                  | `DeepgramSTTProvider`   | Commercial API             |
| **ElevenLabs**        | WebSocket / REST         | ~250ms - 400ms   | Ultra-realistic voice synthesis, conversational AI agent platform     | `ElevenLabsTTSProvider` | Commercial API             |
| **OpenAI Realtime**   | WebSocket                | ~300ms - 500ms   | Direct speech-to-speech multimodal model (gpt-4o-realtime)            | `OpenAIVoiceProvider`   | Commercial API             |

---

## 3. Calendar & CRM Architecture Standards

### Calendar Integration

- **Google Calendar API v3**: OAuth2 authorization, free/busy availability queries, RFC 5545 recurrence rules, webhook push notifications for event modifications.
- **Cal.com v2 API**: Open-source scheduling platform, API-first slot calculation, team booking workflows.
- **Microsoft Graph Calendar API**: Enterprise Outlook/Exchange calendar integration, delegate access.

### CRM Integration

- **HubSpot CRM API v3**: Contact deduplication by email/phone, engagement timelines, custom properties for lead score and qualification breakdown.
- **Generic Webhook CRM**: HMAC SHA-256 signed JSON payload delivery for custom Zapier/Make/Gohighlevel integrations.

---

## 4. Key Lessons for VoxDesk AI Originality

1. **Deterministic Demo Provider**: Existing SaaS solutions fail in client sales demos when third-party API credentials expire, credit limits are exceeded, or latency spikes. VoxDesk AI implements `DemoVoiceProvider`, a 100% deterministic, zero-dependency browser and server call simulator.
2. **Hybrid Guardrailed State Machine**: Unconstrained LLMs often hallucinate invalid calendar slots or misinterpret cancellation rules. VoxDesk AI combines natural language understanding with a strict server-enforced conversation state machine.
3. **Structured Lead Qualification Matrix**: VoxDesk AI calculates numerical scores (BANT / CHAMP model) with explicit criteria evidence instead of raw unstructured summary text.
4. **Context-Rich Human Escalation**: When transfer is requested, VoxDesk AI generates a structured "Transfer Brief" for human operators, preventing callers from repeating information.
