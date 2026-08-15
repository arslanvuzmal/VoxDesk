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

### CI — pending final tracker revalidation

The prior tracker SHA passed CI in run #481. This evidence update requires a
separate run against its own exact SHA.

Evidence: format, lint, typecheck, Prisma validation, tests, route audit, build,
and E2E run against the exact branch SHA.

### Preview database — pending

Evidence: reviewed migrations, a Preview application, persisted conversation,
call, CRM, campaign, provider-event, and background-job records, plus backup and
rollback procedures.

### Environment — pending

Evidence: sanitized readiness confirms the database, security secrets, web voice
configuration, URLs, and explicit telephony mode.

### Simulation — pending

Evidence: qualification, appointment, handoff, failure, and opt-out scenarios
with idempotency and dashboard proof.

### Web Voice — pending

Evidence: a signed provider session, authorized action, canonical conversation,
post-call reconciliation, and no duplicate side effects.

### CRM operations — pending

Evidence: truthful persisted-data views, tenant isolation, masked browser data,
and useful empty and error states.

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

GitHub Actions run #481 passed for commit
`5eaf175c1f9230b6b5257595c2b1dba929bc8f17`.

- Repository validation passed: Prisma validation, format check, documentation
  links, lint, typecheck, production build, local-server startup, and route
  audit.
- Unit, integration, and security tests passed.
- The independent production-build job passed.
- Playwright browser acceptance passed.
- Dependency review passed.

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
