# VoxDesk AI — Production Voice Verification Protocol

**Author:** Arslan Vuzmal Lone  
**Production URL:** https://voxdesk-ai.vercel.app  
**Date:** 2026-08-03

---

## Production Verification Checklist

1. **Session Start & Cookie**:
   - `POST /api/demo/session/start` returns HTTP 200 with opaque signed cookie.

2. **Quick Sample Input & Response**:
   - `POST /api/demo/respond` accepts UUID turn IDs and returns 200 with `responseId` voucher and `spokenReply`.

3. **Scenario Tests**:
   - **BOOKING**: Reserves consultation slot, returns `CONFIRM_APPOINTMENT` action.
   - **QUALIFICATION**: Evaluates BANT budget & timeline, assigns lead category.
   - **ESCALATION**: Generates urgent human transfer brief.
   - **ROUTINE**: Answers approved knowledge base questions.

4. **TTS Audio & Replay**:
   - `POST /api/demo/tts` synthesizes voice audio via voucher and enables browser replay.
