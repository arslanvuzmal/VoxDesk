---
name: voice-provider-review
description: Evaluates pluggable voice telephony providers, audio streaming performance, fallback handling, and latency metrics for VoxDesk AI.
---

# Voice Provider Review Skill

## When to Use

Use when reviewing or adding telephony adapters (Twilio, Vapi, Retell, LiveKit), evaluating speech recognition (STT) or synthesis (TTS) providers, or verifying latency benchmarks.

## Inputs Required

- Provider specification / API contract.
- Expected audio streaming format (e.g., PCM 16kHz, Mulaw 8kHz).
- Network latency targets (<500ms total response time).

## Step-by-Step Process

1. Inspect provider SDK capabilities and streaming protocol (WebSocket / WebRTC / HTTP REST).
2. Verify adapter implementation against common `VoiceProvider` interface.
3. Test fallbacks to `DemoVoiceProvider` when external API credentials are absent or fail health checks.
4. Measure latency metrics: Speech-to-Text (STT), Language Model (LLM), Text-to-Speech (TTS).
5. Document provider health status and fallback triggers.

## Decision Tree

- **Are credentials present?**
  - YES -> Run active health check -> If success, mark OPERATIONAL; If fail, mark DEGRADED.
  - NO -> Fall back to `DemoVoiceProvider` -> Mark DEMO mode.

## Validation Checklist

- [ ] Provider interface adheres to standard `createAgent`, `startCall`, `endCall`, `verifyWebhook` methods.
- [ ] No client-side exposure of API keys.
- [ ] Latency metrics tracked per call.

## Failure Conditions

- Telephony webhook fails signature verification.
- Provider call setup hangs exceeding 3000ms timeout.

## Expected Output

Structured provider health audit report with latency breakdowns and fallback verification.
