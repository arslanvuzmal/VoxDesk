# ADR-0004: Simulation and Live Telephony Separation

**Status:** Accepted

**Context:** A public portfolio must demonstrate architecture without incurring carrier cost or making unapproved calls.

**Decision:** `TELEPHONY_MODE=simulation` uses an internal provider; `live` requires explicit resources and fails closed.

**Alternatives:** Fake successful calls or automatic fallback from failed live configuration.

**Consequences:** Simulation and live records are visibly distinct.
**Security/operations:** Simulation is authenticated, never enters public webhooks, and cannot invoke Telnyx.
