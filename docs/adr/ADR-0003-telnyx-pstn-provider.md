# ADR-0003: Telnyx as PSTN Provider

**Status:** Accepted

**Context:** Phone numbers, PSTN/SIP, caller ID, call control, transfer, and voice events need a telephony owner.

**Decision:** Telnyx is the canonical production PSTN/SIP adapter.

**Alternatives:** Multiple production carrier implementations without a customer requirement.

**Consequences:** Provider events are normalized and adapter code stays outside UI.
**Security/operations:** Raw signed events, timestamps, replay protection, and idempotent event identity are mandatory.
