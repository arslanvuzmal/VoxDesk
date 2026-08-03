# VoxDesk AI — Voice Response Failure Audit

**Project Owner:** Arslan Vuzmal Lone  
**Production Deployment ID:** dpl_GKCztNvBvVaGrYVmcUZ8zvpDmVaX  
**Commit:** 0695ec0  
**Audit Date:** 2026-08-03

---

## 1. Failure Reproduction & Log Analysis

### Observed Runtime Behavior

- `POST /api/demo/session/start` → `200 OK` (Cookie `voxdesk_demo_session` set)
- `POST /api/demo/stt-token` → `200 OK`
- `POST /api/demo/respond` → `401 Session expired or invalid`

### Root Cause Analysis

1. **Serverless Ephemeral Memory Disconnect**:
   - `lib/demo/store.ts` fell back to `MemoryDemoSessionStore` when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` were unconfigured or unread in Vercel production environment variables.
   - Vercel routes `/api/demo/session/start` and `/api/demo/respond` were executed in separate serverless container instances.
   - Instance B (`/api/demo/respond`) evaluated an in-memory `Map` containing 0 sessions, throwing `401 Session expired or invalid`.

2. **Frontend Error Masking & Stale Closures**:
   - `app/demo/page.tsx` had `catch { setActiveSession(true); }` which opened the voice console even when session start failed or returned non-200.
   - `components/calls/real-voice-console.tsx` silently swallowed `/api/demo/respond` non-200 responses without notifying the user or offering session restart.
   - `SpeechRecognition.onend` closed over initial empty `currentSpeechInput` state, missing transcribed text.
   - Sample inputs called `/api/demo/respond` directly without checking scenario context or session validity.

---

## 2. Mandatory Remediation Strategy

1. **Strict Production Store Selection (Phase 2 & 3)**:
   - In `NODE_ENV === "production"`, `lib/demo/store.ts` MUST require Upstash Redis variables and instantiate `RedisDemoSessionStore`.
   - If Redis is unconfigured in production, `/api/demo/session/start` returns `503 DEMO_SESSION_STORE_UNAVAILABLE` and prevents console entry.

2. **Reliable Session Start & Client API Helper (Phase 4 & 5)**:
   - Create `lib/client/demo-api.ts` with explicit `credentials: "include"`, `cache: "no-store"`, and error handling.
   - Update `app/demo/page.tsx` to check `response.ok === true` and `data.success === true` before activating the console.

3. **Frontend Error Recovery & Manual Text Input (Phase 6, 7 & 8)**:
   - Display visible error banners on 401/409/429/500 with recovery buttons.
   - Make Quick Sample Input scenario-specific (Booking, Qualification, Escalation, Routine).
   - Add manual text input (max 600 chars) for clients without microphone access.

4. **Microphone Ref Fix & ElevenLabs STT Connection (Phase 9, 10 & 11)**:
   - Use `finalTranscriptRef` and `interimTranscriptRef` to prevent stale closure bugs in `onend`.
   - Implement `/api/demo/stt-disconnect` to release `activeSTTConnection` locks cleanly.

5. **Dynamic Actions & Context Preservation (Phase 12, 13, 14 & 15)**:
   - Pass recent conversation history (last 4 turns) to OpenRouter.
   - Replace hardcoded outcome claims with state-driven cards reflecting real actions.
