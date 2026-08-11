# VoxDesk Engineering Instructions

This is a security-sensitive, multi-tenant Next.js application. Read the relevant local Next.js documentation before changing Next APIs or routing conventions.

## Working loop

Discover -> audit -> plan -> implement -> test -> review diff -> document -> commit. Keep changes focused and do not reset, force-push, delete data, or discard user work.

## Non-negotiable boundaries

- Resolve session, membership, role, workspace, then resource. IDs never grant authority.
- Models request actions; server-owned tools authorize, validate, apply idempotency, and persist safe results.
- Provider webhooks require raw-body verification, timestamp/replay checks, event identity, prompt acknowledgement, and asynchronous projection.
- Simulation is explicit and authenticated. It never calls Telnyx or enters public provider webhook routes.
- Telnyx is the production PSTN/SIP boundary and ElevenLabs is the conversational boundary. Keep provider code out of UI components.
- Use additive migrations and review SQL. Never use `db push` for production delivery.
- Never invent data, weaken auth, bypass security validation, commit secrets, or claim provider verification without an authorized test.

## Verification

Run the smallest relevant tests first, then `npx prisma validate`, lint, typecheck, and the affected suite. Review `git diff --check`. Browser tests must target a VoxDesk server, not another project sharing the local port.

## Documentation

Update docs when behavior, provider boundaries, activation requirements, migration delivery, or user-visible capability state changes. Use the vocabulary: implemented, configured, verified, simulated, activation-required, and planned.
