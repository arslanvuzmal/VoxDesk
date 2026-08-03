# VoxDesk AI — Real Voice Demo Specifications

**Owner:** Arslan Vuzmal Lone  
**Official URL:** https://voxdesk-ai.vercel.app/demo  

---

## 1. Overview

VoxDesk AI provides a browser-based interactive voice demonstration that allows prospective clients to test natural speech interactions with an AI voice receptionist.

The experience connects:
1. Microphone input transcribed via ElevenLabs Scribe Realtime (or Web Speech API fallback).
2. Server-side OpenRouter LLM (`lib/providers/openrouter.server.ts`) with Zod-validated structured outputs.
3. Server-side ElevenLabs Text-to-Speech (`lib/providers/elevenlabs-tts.server.ts`) with browser Web Speech synthesis fallback.
4. Server-enforced state machine managing appointment booking, lead qualification, human escalation, and CRM records.

---

## 2. Business Scenarios

1. **Missed Appointment Opportunity**: Inbound caller seeking after-hours consultation booking.
2. **Unqualified Sales Enquiry**: Inbound enquiry scored via BANT (Budget, Authority, Need, Timeline).
3. **Important Call Needing a Person**: Urgent caller request generating a structured Transfer Briefing.
4. **Routine Question**: Approved knowledge Q&A handling.
