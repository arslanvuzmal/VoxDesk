# Public Demo Abuse Model

The portfolio demo is an authenticated/authorized application experience with explicit fictional data and deterministic telephony simulation.

| Risk                     | Control                                                                                             |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| Carrier spend            | Simulation mode never invokes Telnyx.                                                               |
| Provider cost exhaustion | Demo/session and workspace rate limits, bounded turns, and duration limits.                         |
| Tenant leakage           | Workspace-scoped access and separate fictional demo data.                                           |
| Tool abuse               | Signed conversation context, allowlisted tool schemas, server-owned authorization, and idempotency. |
| Webhook forgery          | Simulation does not use public webhooks; provider endpoints verify raw signatures and timestamps.   |
| Misrepresentation        | Every simulated record and result is visibly labelled as simulation.                                |

Simulation is not a fallback for an unhealthy live provider. Live telephony must be explicitly activated and verified.
