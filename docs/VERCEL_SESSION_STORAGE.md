# VoxDesk AI — Vercel Serverless Session Storage Architecture

**Author:** Arslan Vuzmal Lone  
**Date:** 2026-08-03

---

## Serverless Session Persistence Model

In Vercel Serverless environments:

1. `MemoryDemoSessionStore` is prohibited in production because incoming HTTP requests land on isolated container instances.
2. `RedisDemoSessionStore` connects to Upstash Redis using REST API tokens (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`).
3. Cookies store opaque signed session IDs (`sess_...`), verified using timing-safe HMAC-SHA256 comparison.
4. When Redis is unconfigured in production, `/api/demo/session/start` returns `503 DEMO_SESSION_STORE_UNAVAILABLE` rather than allowing broken memory sessions.
