# Live Provider Testing

Live tests are manual and authorized only. They require a customer-owned Telnyx number, verified webhooks, configured ElevenLabs SIP/agent resources, consented test recipients, and a target workspace with known-safe business policy.

Verify inbound, requested callback outbound, concurrent calls where the plan permits, handoff behavior, tool persistence, provider IDs, correlation, transcript reconciliation, and absence of cross-tenant leakage. Record the commit SHA, environment, time, and redacted result. Do not run these checks from CI or against arbitrary telephone numbers.
