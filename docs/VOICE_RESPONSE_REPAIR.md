# VoxDesk AI — Voice Response Repair Documentation

**Project Owner:** Arslan Vuzmal Lone  
**Production URL:** https://voxdesk-ai.vercel.app  
**Date:** 2026-08-03

---

## Technical Summary of Voice Flow Overhaul

### 1. Cross-Instance Serverless Session Persistence

- **Problem**: Vercel serverless functions executing `/api/demo/session/start` and `/api/demo/respond` had separate in-memory maps, causing `401 Session expired or invalid`.
- **Solution**: Enforced Upstash Redis (`RedisDemoSessionStore`) in `NODE_ENV === "production"`. Disabled memory session fallback in production, returning `503 DEMO_SESSION_STORE_UNAVAILABLE` if Redis is missing.

### 2. Reliable Session Start & API Helper (`lib/client/demo-api.ts`)

- Created a centralized client API module enforcing `credentials: "include"`, `cache: "no-store"`, and Zod-typed responses.
- `app/demo/page.tsx` checks `response.ok === true` and `data.success === true` before activating the voice console.

### 3. Voice Console & Input Fixes (`components/calls/real-voice-console.tsx`)

- Ref-based Speech Recognition (`finalTranscriptRef`, `interimTranscriptRef`) prevents stale closure bugs during `onend`.
- Scenario-specific Quick Sample Input buttons guarantee test paths for Booking, Qualification, Escalation, and Routine scenarios.
- Compact Manual Text Input (max 600 chars) provides a no-microphone alternative.
- TTS single-use `responseId` vouchers are fetched and played, with in-memory Audio Blob caching for instant replay.

### 4. Dynamic Business Action Panels

- Replaced hardcoded static strings with state-driven dynamic action notices that reflect real appointment confirmations, lead scores, and human transfer briefs.
