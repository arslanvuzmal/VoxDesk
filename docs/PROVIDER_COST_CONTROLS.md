# VoxDesk AI — Provider Cost Controls & Budgeting

**Owner:** Arslan Vuzmal Lone

---

## Cost Control Directives

- **OpenRouter Model Selection:** Configured via `OPENROUTER_MODEL` (defaulting to low-cost conversational models like `openai/gpt-4o-mini`).
- **ElevenLabs Models:** Text-to-speech uses ultra low-cost `eleven_flash_v2_5`; STT uses `scribe_v2_realtime`.
- **Character & Turn Budgets:** Agent replies are enforced under 350 characters server-side before calling ElevenLabs TTS.
- **Graceful Fallbacks:** If provider credits expire or API keys are omitted, the application automatically switches to Web Speech API fallback.
