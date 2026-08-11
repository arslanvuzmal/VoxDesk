# Scaling and Capacity

VoxDesk is a modular Next.js application. It does not claim a particular throughput, latency, or uptime target without deployment evidence.

Capacity controls are modeled through provider/workspace/business/agent/phone/campaign scopes, expiring concurrency leases, queue priority, and an inbound reserve. Inbound traffic has priority over outbound campaigns. Provider limits and customer-configured limits are deployment inputs.

For a production rollout, measure queue depth, provider latency, duplicate/out-of-order event rate, tool failures, reconciliation latency, and lease cleanup. See [async processing](architecture/async-processing.md) and the [runbooks](operations/runbooks/README.md).
