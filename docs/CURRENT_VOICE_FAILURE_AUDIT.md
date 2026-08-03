# VoxDesk AI — Current Voice Pipeline Failure Audit

**Project Owner:** Arslan Vuzmal Lone  
**Audit Date:** August 3, 2026  
**Current Deployment ID:** `dpl_BwbYJbDVE4r8VWA5e95QtU3m8WES`  
**Current Git Commit:** `b5b7672`  
**Target Domain:** https://voxdesk-ai.vercel.app

---

## 1. Failure Symptom Analysis

- **Endpoint:** `POST /api/demo/session/start`
- **Response Status:** `503 Service Unavailable`
- **Safe Response Body:**
  ```json
  {
    "error": "The live demo is temporarily unavailable.",
    "code": "DEMO_SESSION_STORE_UNAVAILABLE",
    "correlationId": "req_...",
    "recoverable": false,
    "guidedDemoUrl": "/demo/story"
  }
  ```

---

## 2. Infrastructure Health & Environment Status

| Component                         | Status                        | Details                                                                                                                                                                                                                                           |
| --------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Session Store Provider**        | `Unavailable`                 | In `NODE_ENV === "production"`, `lib/demo/store.ts` strictly enforces `UpstashRedisSessionStore` and refuses to fall back to volatile memory. `UPSTASH_REDIS_REST_URL` or `UPSTASH_REDIS_REST_TOKEN` is missing in Vercel Production Environment. |
| **Missing Environment Variables** | `Action Required`             | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`                                                                                                                                             |
| **Redis Health Status**           | `Not Ready`                   | Requires Vercel Environment Variable configuration.                                                                                                                                                                                               |
| **Database Host Category**        | `External Managed PostgreSQL` | Configured via `DATABASE_URL` (pooled) & `DIRECT_URL` (direct) in `prisma/schema.prisma`. Must never use localhost/127.0.0.1.                                                                                                                     |
| **Cloudflare Provider Status**    | `Pending Integration`         | Requires new dedicated `voxdesk-workers-ai-production` API token configured in Vercel.                                                                                                                                                            |
| **Speech-to-Text (STT)**          | `Transitioning`               | Transitioning to Cloudflare Flux (`@cf/deepgram/flux`).                                                                                                                                                                                           |
| **Language Model (LLM)**          | `Transitioning`               | Transitioning to Cloudflare Workers AI (`@cf/moonshotai/kimi-k2.6`).                                                                                                                                                                              |
| **Text-to-Speech (TTS)**          | `Transitioning`               | Transitioning to Cloudflare Aura (`@cf/deepgram/aura-2-en`).                                                                                                                                                                                      |

---

## 3. Targeted Repair Plan

1. **Phase 1 — Persistent Infrastructure & Session Health**:
   - Verify `getDemoInfrastructureStatus()` returns `{ sessionStore: { provider: "redis", ready: true }, database: { provider: "postgresql", ready: true }, cloudflareAI: { configured: true, ready: true } }`.
   - Update `app/api/demo/session/status/route.ts` and `app/api/demo/session/start/route.ts`.
2. **Phase 2 — Managed Database Integrity**:
   - Ensure Prisma client handles database connection failures cleanly without granting fake completions or appointments.
3. **Phase 3-16 — Cloudflare Workers AI Integration**:
   - Server-only modules in `lib/providers/cloudflare/`: `client.server.ts`, `llm.server.ts`, `tts.server.ts`, `stt.server.ts`, `errors.ts`, `schemas.ts`, `usage.ts`.
   - System prompt & few-shot examples in `lib/conversation/prompts/voice-agent-system.ts`, `lib/conversation/prompts/few-shot-examples.ts`, knowledge base in `lib/conversation/knowledge/northstar-legal.ts`.
   - Server-enforced state machine in `lib/conversation/state-machine.ts`.
   - Cloudflare AI Kill switch (`CLOUDFLARE_AI_KILL_SWITCH="false"`).
