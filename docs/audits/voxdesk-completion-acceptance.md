# VoxDesk Completion Acceptance Tracker

## Baseline

- Repository: `arslanvuzmal/VoxDesk`
- Working branch: `agent/voxdesk-completion`
- Baseline commit: `b719b8729afdf7e7e4b3a28cd764592a84cb591c`
- Baseline date: 2026-08-15
- Default telephony mode: simulation
- Live telephony: disabled until provider acceptance evidence exists

This tracker records evidence, not aspirational status. A configured provider or a successful deployment does not establish live telephony readiness.

## Acceptance gates

| Gate | Required evidence | Current state |
| --- | --- | --- |
| Repository baseline | Dedicated branch, known SHA, no unrelated changes | Initiated |
| CI | Format, lint, typecheck, Prisma validation, tests, route audit, build, and E2E on the exact branch SHA | Pending |
| Preview database | Reviewed migrations, Preview application, persisted conversation/call/CRM/campaign/provider/job records, backup and rollback procedure | Pending |
| Environment | Sanitized readiness confirms database, security secrets, web voice configuration, URLs, and explicit telephony mode | Pending |
| Simulation | Qualification, appointment, handoff, failure, and opt-out scenarios with idempotency and dashboard evidence | Pending |
| Web Voice | Signed provider session, authorized action, canonical conversation, post-call reconciliation, no duplicate side effects | Pending |
| CRM operations | Truthful persisted-data views, tenant isolation, masked browser data, useful empty and error states | Pending |
| Outbound controls | Approved campaign, consent, suppression, window, limits, caller ID, provider readiness, lease, reconciliation, inbound priority | Pending |
| Live providers | Owned authorized test numbers and evidence for inbound, outbound, concurrency, transfer, replay, duplicate, out-of-order, and failure events | Activation required |
| Reliability | Durable event inbox, retries, stale-lock recovery, dead-letter handling, lease release, sanitized logs, and honest outage behavior | Pending |
| UI and accessibility | Responsive and keyboard/screen-reader review with truthful statuses and no fabricated metrics | Pending |
| Release | Exact Preview and production SHA verification, smoke tests, logs, and rollback target | Pending |

## Evidence rules

- Keep simulation evidence separate from live-provider evidence.
- Do not expose secrets, raw credentials, or full PII in logs, reports, or browser responses.
- Do not claim a call, transfer, calendar action, or CRM write unless the authoritative provider or domain record confirms it.
- Do not run provider tests without customer-owned, authorized resources.
- Record failures as failures, including the correlation ID and safe operational context needed for recovery.

## Completion criterion

VoxDesk is considered strong only when a single interaction can travel through:

`Customer -> channel -> provider or simulation -> Conversation -> authorized tool -> CRM action -> finalization -> evaluation`

with tenant isolation, idempotent side effects, accurate persisted data, and observable bounded failures.
