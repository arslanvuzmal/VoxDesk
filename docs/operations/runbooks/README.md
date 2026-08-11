# Operational Runbooks

Use correlation IDs and sanitized logs. Never paste a credential, full customer identifier, or raw transcript into an incident ticket.

## Database unavailable

**Symptoms:** health/database fails, Prisma connection errors, persistence failures. **Impact:** CRM/tool persistence unavailable. **Immediate action:** stop side-effecting workflows that cannot persist safely. **Diagnosis:** verify deployment environment, database endpoint, pool/direct delivery path, and migration state. **Recovery:** restore connectivity, run a safe health query, then reconcile queued events. **Prevention:** use reviewed migrations and readiness checks.

## Redis or lease unavailable

**Symptoms:** queue/lease health degraded. **Impact:** distributed capacity and outbound safety are uncertain. **Immediate action:** pause live outbound campaigns. **Diagnosis:** inspect Redis configuration and connection failures. **Recovery:** restore service and verify stale-lock cleanup before resume. **Prevention:** fail closed for outbound capacity.

## ElevenLabs or Telnyx unavailable

**Symptoms:** provider health degraded, initiation/agent failures, webhook gaps. **Impact:** channel-specific conversations cannot progress. **Immediate action:** show an honest unavailable state and offer human/task fallback where policy permits. **Diagnosis:** check provider status, credentials, readiness, and webhook delivery. **Recovery:** retry only safe categories and reconcile provider events. **Prevention:** separate configured from verified readiness.

## Webhook signature failure or backlog

**Symptoms:** rejected requests, duplicate inbox events, delayed projection. **Immediate action:** do not bypass verification. **Diagnosis:** compare timestamp/signature configuration and queue depth using safe metadata. **Recovery:** correct provider configuration, replay verified events through the supported reconciliation path. **Prevention:** raw-body verification, event IDs, bounded retries.

## Outbound queue stuck or stale lock

**Symptoms:** attempts remain queued, capacity never releases. **Immediate action:** pause the campaign. **Diagnosis:** inspect lease TTL, job attempt state, provider correlation, and calling-window eligibility. **Recovery:** use stale-lock cleanup and idempotent retry; do not create a new attempt blindly. **Prevention:** TTL heartbeat and attempt fingerprints.

## Migration failure or deployment regression

**Symptoms:** build/runtime error after a release. **Immediate action:** stop promotion and preserve logs. **Diagnosis:** identify exact SHA, migration state, and failed route. **Recovery:** roll back application to known-good artifact; use the approved database restore/forward-fix plan rather than destructive rollback. **Verification:** rerun health and critical journey checks. **Prevention:** preview migration review and exact-SHA smoke tests.

## Demo unavailable or rate limit exhausted

**Symptoms:** public demo cannot start. **Impact:** portfolio experience only; do not mislabel as live telephony outage. **Immediate action:** report simulation readiness honestly. **Diagnosis:** database/demo configuration, rate limits, and deployment logs. **Recovery:** restore prerequisites or wait for the configured window. **Prevention:** distinguish public simulation from provider activation.
