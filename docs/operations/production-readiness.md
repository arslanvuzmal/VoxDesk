# Production Readiness

Use this checklist for a specific deployment. Check an item only with recorded evidence.

- [ ] Exact commit SHA and deployment target identified
- [ ] Reviewed additive migrations applied and verified
- [ ] Database, Redis/lease, authentication, and security secret readiness checked
- [ ] Workspace, business, agent version, training pack, and language profile configured
- [ ] Knowledge and policy content reviewed
- [ ] Rate/cost limits, recording, consent, suppression, and retention policies configured
- [ ] Provider webhook signatures and replay protections tested
- [ ] Telephony mode verified: simulation or activated live resources
- [ ] Health routes, dashboard routes, demo, logs, and rollback target checked
- [ ] Owned/authorized live provider tests completed when live telephony is enabled

The checklist is intentionally incomplete until the target environment provides evidence.
