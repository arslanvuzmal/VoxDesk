# Local Development

## Prerequisites

- Node.js 20+
- PostgreSQL for persisted behavior
- Redis-compatible service when testing distributed lease/quota behavior

## Setup

```bash
npm ci
cp .env.example .env.local
npx prisma migrate dev
npm run dev
```

Use `TELEPHONY_MODE=simulation` unless you are performing an approved live-provider test. `npm run demo:seed` may be used only against a disposable/demo database. Never seed a customer production database without explicit, reviewed authorization.

## Verification

Run targeted checks while iterating, then the commands in [testing strategy](../testing/strategy.md). If another project is already listening on port 3000, use an isolated local port for browser tests rather than trusting a response from the wrong application.
