# Contributing to VoxDesk

VoxDesk is a modular Next.js application with security-sensitive customer and provider boundaries. Small, reviewable changes are preferred.

## Before you start

- Read [the documentation portal](docs/README.md) and the relevant architecture document.
- Use Node.js 20 or later and `npm ci`.
- Copy `.env.example` to an ignored local environment file. Never paste a credential into an issue, PR, commit, or test fixture.
- Run `npx prisma validate` before changing the Prisma schema.

## Development workflow

1. Branch from the current integration branch using `feat/`, `fix/`, `docs/`, `refactor/`, `test/`, `chore/`, or `security/`.
2. Keep a change within one clear concern: domain behavior, provider boundary, migration, documentation, or UI.
3. Add or update tests for behavior changes. Provider tests must remain mocked or use explicitly authorized manual live-test commands.
4. Run the relevant checks and review `git diff --check` before opening a PR.

```bash
npm ci
npx prisma validate
npm run lint
npm run typecheck
npm run test:unit
```

Use `npm run verify` only when the local database and browser prerequisites are available. It is the broad verification command, not a substitute for understanding failures.

## Architecture boundaries

- Routes validate and authorize; domain services apply business rules; provider adapters call external systems.
- Models may request tools. Only server-side authorization and domain services may create CRM, calendar, campaign, or handoff state.
- Every workspace-owned read or write must be scoped through an authorized workspace.
- Telephony simulation is explicit. Do not route simulated activity through public provider webhooks or represent it as a live call.
- Telnyx is the PSTN/SIP adapter and ElevenLabs is the conversational layer. Do not add a second production voice stack without an ADR and tests.

## Migrations

Use additive Prisma migrations. Review generated SQL, test it against a disposable or preview database, and document any backfill or rollback concern in the PR. Production uses `prisma migrate deploy`; never use `db push` as a production delivery mechanism.

## Security expectations

Do not weaken authorization, signatures, rate limits, consent, suppression, or secret validation to make a demo pass. Redact logs and screenshots. Report vulnerabilities through [SECURITY.md](SECURITY.md), not a public issue.

## Pull requests

Use the PR template. Include the actual verification performed, note database/provider impact, and state whether a capability is implemented, configured, simulated, or activation-required. Do not claim live provider verification unless it used owned and authorized resources.
