# ADR-0001: Canonical Conversation Model

**Status:** Accepted

**Context:** Phone, web voice, and web text need one operational history without pretending every channel is a PSTN call.

**Decision:** `Conversation` is canonical; `Call` remains a phone-specific projection/correlation record.

**Alternatives:** Separate channel-specific histories.

**Consequences:** Customer timelines and tools converge; migration must remain additive.
**Security/operations:** Every record is workspace-scoped and correlated to provider events where relevant.
