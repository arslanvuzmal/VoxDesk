# VoxDesk AI — Scaling & Capacity Planning Guide

**Owner:** Arslan Vuzmal Lone  
**Product:** VoxDesk AI

---

## 1. Capacity Architecture

VoxDesk AI is designed to scale horizontally across serverless edge infrastructure while maintaining cost controls and low latency (<800ms speech-to-speech roundtrips).

```
                            ┌────────────────────────┐
                            │ Cloudflare Edge / CDN  │
                            └───────────┬────────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
    ┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
    │ Vercel Serverless│        │ Cloudflare AI   │        │ Upstash Redis   │
    │ App Router Nodes│        │ Workers Nodes   │        │ Session Store   │
    └────────┬────────┘        └────────┬────────┘        └────────┬────────┘
             │                          │                          │
             └──────────────────────────┼──────────────────────────┘
                                        ▼
                            ┌────────────────────────┐
                            │ Supabase PostgreSQL DB │
                            └────────────────────────┘
```

---

## 2. Concurrency & Rate Limiting Controls

1. **IP Daily Limit**:
   - `DEMO_SESSIONS_PER_IP_PER_DAY=3`
   - Prevents API exhaustion from malicious scrapers.

2. **Cooldown Enforcement**:
   - `DEMO_SESSION_COOLDOWN_SECONDS=60`
   - Enforces a 60-second wait between session starts from the same IP.

3. **Session Turn Limit**:
   - Hard capped at 10 turns per demo call to maintain tight cost control ($<0.02 per call).

4. **Zero-Config In-Memory Fallback**:
   - When Upstash Redis or Vercel KV is not configured, VoxDesk seamlessly falls back to `globalThis` memory maps for zero-config deployments.

---

## 3. Database Connection Pooling

- Prisma client configured with direct connection strings and connection pooling (`directUrl` and `url`).
- Prepared statements enabled for query optimization.
