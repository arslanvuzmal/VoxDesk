# Telephony Simulation Audit

Date: 2026-08-12

## Scope

This audit mapped the current telephony implementation before introducing a
simulation mode. It is deliberately additive: the Telnyx production adapter and
ElevenLabs conversational layer remain the production path.

## Current implementation map

| Area                     | Current implementation                                                                                                                                                             | Assessment                                                                                                                                                           | Action                                                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Production PSTN adapter  | `lib/telephony/providers/telnyx.ts` implements call control, webhook verification, normalized event parsing, health checks and provisioning helpers.                               | Valuable, but is instantiated directly in several services.                                                                                                          | Preserve and select it through a central telephony provider factory.                                                            |
| Telephony contract       | `lib/telephony/contracts/index.ts` defines `TelephonyProvider`, normalized events and the state transition graph.                                                                  | Suitable foundation for a simulator.                                                                                                                                 | Extend minimally with explicit execution mode and simulated provider identity.                                                  |
| Call lifecycle           | `lib/telephony/call-state-machine/index.ts` is server-authoritative.                                                                                                               | Reusable, although a legacy helper has a `TELNIX` typo and incomplete context defaults.                                                                              | Reuse the state machine for simulation; do not route simulation through public webhooks.                                        |
| Telnyx webhook ingestion | `/api/webhooks/telnyx/voice` verifies raw payloads, persists idempotent provider events, responds quickly and schedules processing.                                                | Correct production boundary to retain. Finalization still contains legacy summary and duplicate-side-effect behavior.                                                | Keep this route Telnyx-only. Simulation invokes internal application services instead.                                          |
| Canonical CRM record     | Prisma includes `Conversation`, messages, fields, tool executions and provider correlations, alongside legacy `Call`.                                                              | Additive Conversation architecture exists but legacy writes remain.                                                                                                  | Create simulation records through the same Call + Conversation projection path, with explicit source metadata.                  |
| Live outbound path       | `lib/telephony/outbound/elevenlabs-sip-executor.ts` creates Call + Conversation and calls ElevenLabs SIP after campaign checks.                                                    | Production-oriented and must remain live-only.                                                                                                                       | Provider factory must make this impossible in simulation mode.                                                                  |
| Existing demo mechanisms | `/demo` uses ElevenLabs WebRTC; `/api/demo/respond` uses deterministic/Cloudflare/OpenRouter legacy logic; `lib/voice/providers/demo-provider.ts` is an in-memory legacy provider. | Fragmented and not safe as the telephony simulator: it fabricates names/numbers, has permissive webhook validation, and does not use the primary telephony contract. | Do not reuse for telephony. Retire its telephony role and build a deterministic simulator on `lib/telephony/contracts`.         |
| Provider factory         | `lib/voice/providers/factory.ts` selects legacy Demo/Twilio/Vapi/Retell/LiveKit providers; Telnyx is absent.                                                                       | Conflicts with the intended Telnyx + ElevenLabs architecture.                                                                                                        | Introduce a separate, central `lib/telephony/providers/factory.ts`; leave unrelated legacy voice routes isolated until removed. |
| Readiness                | `provider-readiness.ts` treats configuration as verification; `/api/health/telephony` reports missing Telnyx configuration as not configured.                                      | Does not distinguish portfolio simulation from activation status.                                                                                                    | Replace with a capability matrix and `SIMULATION_READY`, `PROVIDER_CONFIGURED`, `LIVE_READY` states.                            |
| UI                       | `/dashboard/providers`, `/dashboard/phone-numbers`, `/dashboard/calls`, `/dashboard/live` are redirects; integrations is a generic persisted-config table.                         | No capability/readiness experience yet.                                                                                                                              | Add focused provider, activation, and simulated-call surfaces without redesigning the rest of the product.                      |
| Schema                   | `ProviderType` has `DEMO` and `TELNYX`; `Call` lacks execution-mode and simulation metadata.                                                                                       | Cannot safely distinguish a simulated phone lifecycle from a real provider call.                                                                                     | Add an additive `CallExecutionMode` plus nullable `simulationScenario` and `simulationVersion`.                                 |
| Security                 | Session/workspace helper exists; Telnyx webhook has raw-body verification. The generic legacy voice webhook trusts a header and demo provider validates every request.             | Simulation must not use the generic webhook or a magic header.                                                                                                       | Simulation endpoint will require the existing authenticated workspace boundary and will call no external provider.              |
| Documentation            | `README.md` and current architecture docs describe the production target. `docs/DEMO_VS_PRODUCTION.md` is stale and references Twilio, Cloudflare and Supabase/Aurora.             | Public copy conflicts with the intended architecture.                                                                                                                | Replace stale portfolio copy with Telnyx + ElevenLabs simulation/live documentation.                                            |

## Required architecture after this change

```text
Telephony mode
  simulation -> SimulationTelephonyProvider -> normalized events -> Call state machine -> CRM
  live       -> TelnyxProvider              -> normalized events -> Call state machine -> CRM

ElevenLabs remains the realtime conversational layer for web voice and live SIP.
The simulator never invokes Telnyx, ElevenLabs SIP, or a public provider webhook.
```

## Explicit non-goals

- No Telnyx number purchase, carrier resource provisioning, or PSTN call.
- No simulation event submitted to `/api/webhooks/telnyx/voice`.
- No claim that a simulation validates customer phone routing.
- No broad migration away from the existing Conversation model.

## Audit conclusion

The codebase has enough real production structure to support a credible
simulation mode, but it needs one central provider boundary, truthful readiness
states, an explicit database marker for simulated records, and removal of stale
provider claims from portfolio surfaces.
