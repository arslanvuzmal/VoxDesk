# VoxDesk AI — Public Demo Abuse Model & Security Safeguards

**Owner:** Arslan Vuzmal Lone  

---

## Abuse Prevention Architecture

1. **Session Quotas:** Max 3 minutes and 6 conversational turns per demo session.
2. **Character & Token Caps:** User input capped at 600 chars; agent output capped at 350 chars; LLM tokens capped at 160.
3. **IP Hash Ledger:** Max 3 demo sessions per IP address per 24-hour period.
4. **Credential Isolation:** OpenRouter & ElevenLabs API keys exist strictly in server modules guarded by `import "server-only";`. Single-use ephemeral Scribe tokens are issued via `/api/demo/stt-token`.
5. **Deterministic Fallbacks:** When API keys are unconfigured or provider budgets are reached, the system falls back gracefully to browser Web Speech API without crashing.
