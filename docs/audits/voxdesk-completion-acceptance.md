# VoxDesk Completion Acceptance Tracker

## Baseline

- Repository: `arslanvuzmal/VoxDesk`
- Working branch: `agent/voxdesk-completion`
- Baseline commit: `b719b8729afdf7e7e4b3a28cd764592a84cb591c`
- Baseline date: 2026-08-15
- Default telephony mode: simulation
- Live telephony remains disabled until provider acceptance evidence exists.

This tracker records evidence, not aspirational status. A configured provider or
successful deployment does not establish live telephony readiness.

## Acceptance gates

### Repository baseline — initiated

Evidence: a dedicated branch, a known SHA, and no unrelated changes.

### CI — passed

GitHub Actions run #482 passed for the exact branch head
`988ff233a926272ca51a1cb0cd0a3bd23e979404`.

Evidence: format, lint, typecheck, Prisma validation, tests, route audit, build,
and browser acceptance all passed.

### Preview database — schema ready, workflow pending

Evidence so far: all repository migrations are applied on the Neon production
branch, and an isolated Preview branch was created for PR #32. Required
operational tables exist on the Preview branch. It is currently empty, so
persisted simulation and CRM-flow evidence is still pending.

### Environment — provider mismatch confirmed

The Preview deployment is ready and `/api/demo/session/start` returns 200.
However, Web Voice bootstrap returns 502 because ElevenLabs returns HTTP 404
(`ELEVENLABS_AGENT_NOT_FOUND`) for the configured Agent ID. This means the
configured API key and Agent ID are not currently a matching accessible pair, or
the Agent ID is stale. Secret values are not recorded here.

### Simulation — pending

Evidence: qualification, appointment, handoff, failure, and opt-out scenarios
with idempotency and dashboard proof.

### Web Voice — blocked by provider configuration

Evidence cannot be completed until the ElevenLabs Agent ID is copied from the
same workspace as the configured API key and the Preview deployment is
redeployed. A signed provider session, authorized action, canonical
conversation, post-call reconciliation, and no duplicate side effects must then
be re-tested.

### CRM operations — pending

Evidence: truthful persisted-data views, tenant isolation, masked browser data,
and useful empty and error states. No CRM records are claimed from the failed
voice bootstrap.

### Outbound controls — pending

Evidence: approved campaign, consent, suppression, window, limits, caller ID,
provider readiness, lease, reconciliation, and inbound priority.

### Live providers — activation required

Evidence: owned authorized test numbers plus inbound, outbound, concurrency,
transfer, replay, duplicate-event, out-of-order-event, and failure results.

### Reliability — pending

Evidence: durable event inbox, retries, stale-lock recovery, dead-letter
handling, lease release, sanitized logs, and honest outage behavior.

### UI and accessibility — pending

Evidence: responsive and keyboard/screen-reader review with truthful statuses and
no fabricated metrics.

### Release — pending

Evidence: exact Preview and production SHA verification, smoke tests, logs, and
a rollback target.

## Recorded evidence

- GitHub Actions run #482 passed for commit
  `988ff233a926272ca51a1cb0cd0a3bd23e979404`.
- Neon Preview branch `pr-32-voxdesk-completion` was created from the
  production branch. The schema and migration ledger are present; operational
  tables contain zero records in the isolated branch.
- Vercel Preview deployment
  `dpl_3SWPAmBAjctTbpa3XLFb96skJMJ5` is READY.
- Vercel runtime logs show `POST /api/demo/session/start 200` followed by
  `POST /api/demo/voice-bootstrap 502` with
  `ELEVENLABS_AGENT_NOT_FOUND` and provider status 404.

## Evidence rules

- Keep simulation evidence separate from live-provider evidence.
- Do not expose secrets, raw credentials, or full PII in logs, reports, or
  browser responses.
- Do not claim a call, transfer, calendar action, or CRM write unless the
  authoritative provider or domain record confirms it.
- Do not run provider tests without customer-owned, authorized resources.
- Record failures as failures, including the correlation ID and safe operational
  context needed for recovery.

## Completion criterion

VoxDesk is considered strong only when a single interaction can travel through:

```text
Customer -> channel -> provider or simulation -> Conversation
-> authorized tool -> CRM action -> finalization -> evaluation
```

The result must retain tenant isolation, idempotent side effects, accurate
persisted data, and observable bounded failures.
