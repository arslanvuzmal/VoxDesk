# VoxDesk AI — Multilingual Voice Architecture Guide

**Owner:** Arslan Vuzmal Lone  
**Product:** VoxDesk AI

---

## 1. Overview

VoxDesk AI provides native end-to-end multilingual voice support across **English (en-US)**, **Urdu (ur-PK)**, and **Spanish (es-ES)**.

```
Caller (English / Urdu / Spanish)
      │
      ▼
Language-Aware Speech Recognition (Web Speech API / Deepgram)
      │
      ▼
Multilingual Prompt Generation (lib/conversation/prompts/voice-agent-system.ts)
      │
      ▼
Language-Specific Knowledge Retrieval (Organization Profile Approved KB)
      │
      ▼
Natural Voice Synthesis (ElevenLabs / Cloudflare Aura / Web Synthesis)
      │
      ▼
Localized Lead & Summary Record in Database CRM
```

---

## 2. Supported Languages & Locales

| Language    | Locale Code | Default Voice Name | Script / Tone                     |
| :---------- | :---------- | :----------------- | :-------------------------------- |
| **English** | `en-US`     | Maya / Alex        | Latin / Professional              |
| **Urdu**    | `ur-PK`     | Maya               | Nastaliq/Urdu / Warm & Respectful |
| **Spanish** | `es-ES`     | Elena              | Latin / Empathetic                |

---

## 3. Implementation Details

1. **STT Layer**:
   - Browser Web Speech API initialized with `recognition.lang = selectedLanguage`.
   - Deepgram fallback configured with corresponding ISO language model codes.

2. **LLM System Prompt**:
   - `buildVoiceAgentSystemPrompt` dynamically injects language constraint directives.
   - Restricts spoken reply to 1-3 natural, concise sentences in the requested language.

3. **Knowledge Base**:
   - Approved Knowledge Items in `OrganizationProfile` contain localized answers (`en-US`, `ur-PK`, `es-ES`).

4. **CRM Inbox**:
   - Lead records store detected language (`language: "ur-PK"`), enabling localized follow-up sequences.
