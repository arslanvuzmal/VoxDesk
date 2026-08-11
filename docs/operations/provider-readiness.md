# Provider Readiness

Readiness is derived from `lib/telephony/capability-matrix.ts` and the health routes. It intentionally separates implementation from configuration and verification.

| State                 | Meaning                                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------------------- |
| `SIMULATION_READY`    | Simulation mode and persistence prerequisites are available. No PSTN call can be placed.                   |
| `PROVIDER_CONFIGURED` | Some Telnyx resources are present, but live prerequisites are incomplete.                                  |
| `LIVE_READY`          | Required live settings are present. Provider verification and authorized call evidence are still separate. |
| `REQUIRES_ACTIVATION` | Customer/provider resources are missing.                                                                   |

`/api/health/telephony` reports sanitized mode, readiness, activation requirements, and provider status. It must not return credentials, unmasked numbers, or provider response bodies.
