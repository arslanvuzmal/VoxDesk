# Provider Cost Controls

VoxDesk treats voice and outbound execution as cost-bearing operations.

- Public telephony simulation never dials PSTN or consumes Telnyx call minutes.
- Live outbound work is constrained by campaign approval, consent, suppression, local calling window, attempt limits, caller-ID eligibility, provider readiness, and concurrency leases.
- Demo/session rate limits and workspace quotas protect provider and application capacity.
- Provider failures do not create a second call or claim an action succeeded.
- Production limits are customer configuration, not public marketing claims.

See [campaign controls](operations/campaign-controls.md), [telephony](architecture/telephony.md), and [production readiness](operations/production-readiness.md).
