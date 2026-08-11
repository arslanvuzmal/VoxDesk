# Portfolio Simulation vs Live Telephony

| Capability                | Portfolio deployment                  | Client production deployment                |
| ------------------------- | ------------------------------------- | ------------------------------------------- |
| Conversation intelligence | ElevenLabs web voice where configured | ElevenLabs WebRTC and SIP agent             |
| Telephone provider        | Deterministic internal simulator      | Telnyx PSTN and SIP                         |
| External PSTN call        | Never placed                          | Requires customer-owned Telnyx number       |
| Provider events           | Internal normalized simulation events | Signed Telnyx webhooks                      |
| Call state machine        | Same VoxDesk state machinery          | Same VoxDesk state machinery                |
| CRM/tool actions          | Persisted and marked simulation       | Persisted against live provider correlation |
| Campaigns                 | Dry run and simulation                | Controlled live execution after activation  |

Simulation is not a fallback for a failed carrier configuration. It is an explicit
`TELEPHONY_MODE=simulation` product mode. `TELEPHONY_MODE=live` fails closed when
live prerequisites are absent.
