# Async Processing and Durability

Provider webhook requests acknowledge quickly after verification and idempotent event persistence. Projection, reconciliation, finalization, analytics, and quality work are deferred from the acknowledgement path.

Outbound work uses durable attempts, provider correlation, bounded retries, idempotency, and concurrency leases. Inbound capacity has priority. A retry must not create a second appointment, callback, handoff, or call attempt.

Operational failure handling is documented in [runbooks](../operations/runbooks/README.md). Queue/Redis availability is a readiness concern, not permission to remove limits or fail open.
