# VoxDesk AI — Real Voice Demo Audit & Architecture Specification

**Date:** 2026-08-03  
**Project Owner:** Arslan Vuzmal Lone  
**Repository:** `arslanvuzmal/voxdesk-ai`  
**Official URL:** `https://voxdesk-ai.vercel.app`  

---

## 1. Secret Scan & Security Audit

* **Exposed Credentials Scan:** PASSED
* **OpenRouter Key Leaks:** NONE FOUND in codebase, client bundles, or documentation.
* **ElevenLabs Key Leaks:** NONE FOUND in codebase, client bundles, or documentation.
* **Security Enforcement:** Every provider module handling credentials includes `import "server-only";` to guarantee permanent keys never bundle into browser JavaScript.

---

## 2. Real Voice Demo Architecture Overview

```
[ Browser Microphone ]
         |
         | (1. Single-use Scribe Token via /api/demo/stt-token)
         v
[ ElevenLabs Scribe Realtime STT ] 
         |
         | (2. Realtime Transcript)
         v
[ VoxDesk Conversation Engine ] ---> (3. OpenRouter Server Module)
         |
         | (4. State-Machine Rules & Server-Validated Action)
         v
[ ElevenLabs Flash TTS ] / [ Browser Web Speech Fallback ]
         |
         | (5. Audio Stream)
         v
[ Browser Audio Playback ] ---> (6. CRM Demo Activity Record)
```

---

## 3. Rate Limits & Budget Safeguards

| Resource / Quota | Limit | Enforced Location |
| :--- | :--- | :--- |
| **Max Session Duration** | 180 seconds (3 mins) | Server Session Controller |
| **Max Turns per Session** | 6 turns | Server Session Controller |
| **User Input Length** | Max 600 characters | `/api/demo/respond` |
| **Agent Spoken Reply** | Max 350 characters | `lib/providers/openrouter.server.ts` |
| **IP Daily Sessions** | Max 3 sessions per IP per day | Cookie & IP Hash Ledger |
| **Global Concurrent Sessions** | Max 5 sessions | Server Session Controller |
| **Global Daily Session Limit**| Max 75 sessions | Global Daily Ledger |

---

## 4. Key Files Created & Modified

1. `lib/providers/openrouter.server.ts` (Server-only OpenRouter LLM module with `import "server-only";`)
2. `lib/providers/elevenlabs-tts.server.ts` (Server-only ElevenLabs TTS module with `import "server-only";`)
3. `lib/demo/session.ts` (Signed HttpOnly demo session cookie manager & quota ledger)
4. `app/api/demo/session/start/route.ts`
5. `app/api/demo/session/status/route.ts`
6. `app/api/demo/stt-token/route.ts`
7. `app/api/demo/respond/route.ts`
8. `app/api/demo/tts/route.ts`
9. `app/api/demo/action/confirm-appointment/route.ts`
10. `app/api/demo/action/escalate/route.ts`
11. `app/api/demo/session/end/route.ts`
12. `components/calls/real-voice-console.tsx` (Interactive voice demo console with microphone controls, transcription, state visualization, and outcome display)
13. `app/demo/page.tsx` (Redesigned scenario selector & voice sandbox)
