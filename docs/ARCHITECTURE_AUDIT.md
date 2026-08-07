# VOXDESK ARCHITECTURE AUDIT

Audit date: 2026-08-07
Repository: arslanvuzmal/voxdesk-ai
Current commit inspected: main branch at time of audit

## 1. CURRENT IMPLEMENTATION SUMMARY

Telephony provider abstraction exists (`lib/voice/providers/`) with:

- DemoVoiceProvider (functional for demo scenarios)
- TwilioVoiceProvider (stub - returns mock data, no real API calls)
- VapiVoiceProvider (stub)
- RetellVoiceProvider (stub)
- LiveKitVoiceProvider (stub)

No Telnyx provider exists. Zero references to `telnyx`, `sip`, `call_control_id`, `call_session_id`, `call_leg_id`, `consent`, `suppression`, `do_not_call`, `campaign` (except unrelated marketing references), or `webhook signature` ED25519 verification.

Webhooks: `app/api/webhooks/voice/route.ts` exists but uses a generic `x-voice-provider` header approach and HMAC-style verification via provider interface, not Telnyx ED25519. It does not store raw events, does not deduplicate by provider event ID, and does not process asynchronously.

Environment: `.env.example` and `lib/config/env.ts` have no Telnyx variables. No safe production validation for telephony.

Feature flags: None exist for telephony (`TELNYX_TELEPHONY_ENABLED`, etc.). No server-owned feature flag system exists.

Database (`prisma/schema.prisma`):

- `Call` has basic fields (provider, providerCallId, direction, status, startedAt, endedAt, durationSeconds)
- Missing: `providerCallControlId`, `providerCallSessionId`, `providerCallLegId`, `providerConversationId`, `agentVersionId`, `language`, encrypted `fromNumber`/`toNumber`, search hashes, `contactId`, `campaignId`, `terminationReason`, `outcome`
- `CallEvent` exists but is basic (`eventType`, `sequence`, `safePayload`) - no event normalization mapping to Telnyx events
- `CallLeg`, `CallParticipant`, `CallTranscriptLine`, `CallOutcome`, `CallToolExecution`, `CallRecording`, `CallEvaluation` do not exist
- `ConsentRecord`, `SuppressionEntry`, `CommunicationPreference` do not exist
- `Campaign`, `CampaignRecipient`, `OutboundAttempt` do not exist
- `ImprovementObservation`, `ImprovementProposal`, `EvaluationSuite`, `DeploymentCandidate`, `AgentDeployment`, `RollbackRecord` do not exist
- `BusinessTrainingPack` does not exist (only `BusinessProfile`)
- `PhoneNumber` exists but lacks SIP trunk associations and caller-ID eligibility tracking
- `AgentVersion` exists but is basic
- `SipTrunk`, `TelephonyConnection` do not exist

Redis: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are configured but no concurrency lease (`CallConcurrencyLease`) or queue worker exists.

Call state machine (`lib/conversation/state-machine.ts`): Defines conversation states (INITIALISING, GREETING, etc.) for demo voice interaction, not telephony call states (CREATED, QUEUED, RINGING, ANSWERED, etc.).

CRM: `Call`, `Lead`, `Appointment`, `CRMActivity`, `Notification` exist. No `Task`, `Handoff`, `FollowUp`, `ImprovementObservation`, `ImprovementProposal`.

Multilingual: `VoiceAgent` has `language` field (String, default "en-US"). No `LanguageProfile`, no verified language status matrix, no multilingual routing logic.

Campaigns: None. No campaign routes (`/dashboard/campaigns`), no dry-run reports, no approval flow.

Supervised improvement: None. No evaluation framework, no proposal approval, no rollback mechanism.

Concurrent calls: None. No `CallConcurrencyLease`, no atomic lease acquisition, no inbound reserve logic.

SIP trunk: None.

Provider readiness matrix: None.

Testing: Unit tests (10/10 pass) cover state machine, cloudflare AI, demo protection, encryption, organization profiles, qualification, conversation token, voice bootstrap, canonical schema. Integration tests cover booking workflow and three-minute call. Security tests cover cloudflare security, demo protection, tenant isolation. No telephony unit/integration/security tests exist. No concurrent call tests. No webhook verification tests.

CI (`.github/workflows/ci.yml`): Does not include `test:security` properly (runs it) but does not include provider mock verification or live smoke test gates. No `npm run telnyx:*` commands.

Documentation (`docs/`): No `docs/architecture/telephony.md`, `docs/architecture/call-state-machine.md`, `docs/guides/telnyx-setup.md`, `docs/security/webhooks.md`, `docs/security/outbound-compliance.md`. `ARCHITECTURE.md` describes the pluggable architecture but does not specify Telnyx as required telephony provider.

GitHub presentation (`README.md`): Professional but lacks architecture diagrams showing inbound/outbound/concurrent operations, telephony provider matrix, SIP routing, and improvement loop. No screenshots of live operations or concurrent call board.

Security: Webhook verification is provider-generic, not ED25519. No rate limiting for webhooks. No suppression list checks. No consent enforcement. No audit trail for telephony events. No encrypted sensitive values for SIP credentials.

Product design (`app/`): Dashboard pages exist (calls, conversations, live, analytics, agents, etc.) but no live operations board showing concurrent inbound/outbound, no campaign creation UI, no improvement proposal workflow, no language readiness table.

Homepage (`app/(marketing)/page.tsx`): Not inspected in detail but `README.md` indicates it exists. No clear inbound/outbound section with compliance disclaimers.

Scripts (`scripts/`): No `scripts/telnyx/provision.ts`, `verify.ts`, `test-inbound.ts`, `test-outbound.ts`, `test-concurrent.ts`.

## 2. COMPONENT MATRIX

| Component                          | Current Implementation                                                                                                                                                                                                                      | Real Capability                                                                | Missing Capability                                                                                                                                                                                                                              | Duplicate Capability                                                                  | Security Risk                                                                                                                  | Required Change                                                                                                                                              | Test Required                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Telephony Provider (Telnyx)        | None                                                                                                                                                                                                                                        | None                                                                           | Complete provider contract, SIP routing, provisioning, webhook processing, call control                                                                                                                                                         | None                                                                                  | No webhook verification, no tenant isolation for telephony                                                                     | Implement full Telnyx provider                                                                                                                               | Unit, integration, live smoke                                            |
| Telephony Provider (Twilio)        | Stub/mock only                                                                                                                                                                                                                              | None (mock data only)                                                          | Real Twilio integration if kept as secondary                                                                                                                                                                                                    | Overlaps with Telnyx if both primary                                                  | Mock data could mislead users                                                                                                  | Keep as backup/stub or replace; do not make primary                                                                                                          | Verify no fake production claims                                         |
| Conversation Provider (ElevenLabs) | Agent provision script exists (`scripts/provision-elevenlabs-agents.ts`). `lib/providers/elevenlabs-tts.server.ts` exists. React SDK used in demo.                                                                                          | Real agent creation/update via API. TTS works. STT via ElevenLabs or fallback. | SIP-based voice-agent session for telephony. Phone number mapping. Real-time conversation via SIP, not just browser.                                                                                                                            | None                                                                                  | Agent ID exposed in environment. No version control for production agents.                                                     | Ensure ElevenLabs remains canonical. Add SIP destination mapping. Version control.                                                                           | Integration with SIP endpoint                                            |
| SIP Trunk                          | None                                                                                                                                                                                                                                        | None                                                                           | Secure TLS/SRTP trunk between Telnyx and ElevenLabs. Authentication. Header mapping.                                                                                                                                                            | None                                                                                  | Secrets in headers if misconfigured. No encryption capability tracking.                                                        | Implement `SipTrunk` model, provisioning, verification, TLS/SRTP tracking                                                                                    | Unit, integration                                                        |
| Call State Machine                 | Conversation state machine exists (`lib/conversation/state-machine.ts`) for demo flow                                                                                                                                                       | Conversation states only                                                       | Telephony call state machine (CREATED, QUEUED, INITIATING, RINGING, ANSWERED, ACTIVE, ENDING, COMPLETED, etc.)                                                                                                                                  | Two different state concepts (conversation vs call) - acceptable if clearly separated | No server-authoritative call state for telephony. Frontend state could override.                                               | Create separate `CallStateMachine` module in `lib/telephony/call-state-machine/`                                                                             | Unit (all transitions), integration (provider events)                    |
| Inbound Call Flow                  | Generic webhook (`/api/webhooks/voice`) exists but doesn't resolve business, enforce concurrency, or create CRM records properly                                                                                                            | Webhook receives data but does not complete inbound flow                       | Complete inbound: resolve number -> tenant/business -> agent -> SIP -> conversation -> CRM -> evaluation -> finalization                                                                                                                        | Partial overlap with demo session flow                                                | No ED25519 verification. No rate limiting. No idempotency.                                                                     | Rebuild webhook for Telnyx ED25519. Add business resolution. Add concurrency enforcement.                                                                    | Integration (full flow), security (signature verification)               |
| Outbound Call Flow                 | None                                                                                                                                                                                                                                        | None                                                                           | Controlled workflow: authorization -> consent -> suppression -> calling window -> queue -> Telnyx -> agent -> CRM -> evaluation                                                                                                                 | None (new system)                                                                     | Unrestricted calling could violate compliance. No caller-ID validation. No opt-out handling.                                   | Implement campaign module with approval, consent, suppression, rate controls, and safe opening disclosures                                                   | Integration (full workflow), security (consent/suppression)              |
| Concurrent Calls / Concurrency     | None                                                                                                                                                                                                                                        | None                                                                           | Distributed Redis-based lease (`CallConcurrencyLease`) with atomic acquisition, TTL, heartbeat, inbound reserve, outbound throttle                                                                                                              | None                                                                                  | Memory-only locks if implemented incorrectly. No process-independent coordination.                                             | Implement `CallConcurrencyLease` with Redis, reserve logic, queue priority, campaign pacing                                                                  | Integration (simultaneous calls), unit (lease logic)                     |
| Campaign System                    | None                                                                                                                                                                                                                                        | None                                                                           | `Campaign` model, approval flow (`DRAFT` -> `APPROVED` -> `RUNNING` -> `COMPLETED`), dry-run reports, recipient states, concurrency limits, rate controls, opt-out, voicemail behavior                                                          | None                                                                                  | No approval before execution. No suppression. No dry-run.                                                                      | Implement full campaign module with server-side execution only                                                                                               | Integration (approval -> execution -> result), security (consent checks) |
| CRM Operations Workspace           | Basic dashboard pages (`/dashboard/calls`, `/dashboard/conversations`, `/dashboard/live`)                                                                                                                                                   | Basic navigation and pages exist                                               | Professional live-operations board, concurrent operations visualization, improvement proposal workflow, campaign controls, language readiness table, analytics with real metrics                                                                | Basic CRM exists but lacks telephony integration and live operations view             | Sensitive transcript content might be exposed. No audit trail for telephony changes.                                           | Redesign live board. Add concurrent visualization. Add improvement loop UI. Protect transcripts.                                                             | E2E (dashboard flows), security (transcript protection)                  |
| Multilingual Architecture          | `VoiceAgent.language` is `String` (`en-US`). No `LanguageProfile`. No verification status.                                                                                                                                                  | Basic language string                                                          | `LanguageProfile` with verification status (`NOT_CONFIGURED` -> `VERIFIED` -> `DEGRADED`), voice/agent mapping per language, evaluation cases, native review, safe fallback, no silent substitution                                             | None                                                                                  | Unsupported languages could substitute silently without user awareness. No business content verification per language.         | Create `LanguageProfile` model, readiness dashboard, safe fallback rules, evaluation per language                                                            | Integration (language selection -> agent -> result)                      |
| Supervised Improvement             | None                                                                                                                                                                                                                                        | None                                                                           | Deterministic checks -> model evaluation -> observations -> proposals -> approval -> evaluation suite -> canary -> deployment -> rollback. No automatic production changes.                                                                     | None (new system)                                                                     | Uncontrolled changes to prompts/business facts could violate compliance or leak data.                                          | Implement `ImprovementObservation`, `ImprovementProposal`, `EvaluationSuite`, `DeploymentCandidate`, `AgentDeployment`, `RollbackRecord` models and workflow | Unit (approval logic, rollback), integration (evaluation -> deployment)  |
| Provider Readiness Matrix          | None                                                                                                                                                                                                                                        | None                                                                           | `ProviderReadiness` check that verifies actual API/config status for web voice, inbound telephony, outbound telephony, persistence (DB/Redis)                                                                                                   | None                                                                                  | Fake "Live" badges could mislead users. No real verification.                                                                  | Implement provider verification with real safe API/config checks                                                                                             | Unit (readiness checks)                                                  |
| Feature Flags                      | None                                                                                                                                                                                                                                        | None                                                                           | Server-owned flags: `TELNYX_TELEPHONY_ENABLED`, `TELNYX_INBOUND_ENABLED`, `TELNYX_OUTBOUND_ENABLED`, `OUTBOUND_CAMPAIGNS_ENABLED`, `CALL_RECORDING_ENABLED`, `SUPERVISED_IMPROVEMENT_ENABLED`, `MULTILINGUAL_TELEPHONY_ENABLED`. Default false. | None                                                                                  | Security-sensitive switches could be exposed to browser (`NEXT_PUBLIC`).                                                       | Add server-only feature flags with safe defaults                                                                                                             | Unit (flag behavior)                                                     |
| Environment Validation             | Basic `.env` validation (`lib/config/env.ts`). No Telnyx variables validated.                                                                                                                                                               | Basic variable parsing                                                         | Full validation for Telnyx, ElevenLabs, database, Redis, app URL, secrets. Safe failure (report missing names, not values). E.164 validation. Separate Preview/Production.                                                                      | None                                                                                  | Development secrets could be used in production. Fake production values could be created. Missing variables don't fail safely. | Update `env.ts` with full schema including telephony variables                                                                                               | Unit (env validation), security (no value logging)                       |
| Recording/Transcripts/Privacy      | `recordingConsent` exists on `Call`. No retention policies. No jurisdiction checks. No signed access.                                                                                                                                       | Basic consent boolean                                                          | Per-tenant/business/jurisdiction/workflow/direction recording controls. Signed short-lived access to recordings. Retention policies. Redaction workflows. Protected transcripts in analytics.                                                   | None                                                                                  | Full transcripts could be logged casually. No jurisdiction compliance. No access control.                                      | Implement recording policy engine, signed URLs, retention, redaction                                                                                         | Unit (access control), integration (recording workflow)                  |
| Observability                      | Basic error logging (`console.error`). Basic health endpoint (`/api/health/voice`).                                                                                                                                                         | Minimal health endpoint                                                        | Structured logs/metrics for inbound, outbound, blocked, queued, active, answered, failed, tool failures, webhook duplicates, reconciliation delay. Correlation IDs for every call. Sanitized health output.                                     | None                                                                                  | API keys, complete phone numbers, sensitive transcripts could be logged. No correlation IDs.                                   | Implement structured logging, metrics, correlation IDs, sanitized health endpoints                                                                           | Unit (log formatting), integration (correlation tracking)                |
| Security (Webhooks)                | Generic `verifyWebhook` via provider interface. No ED25519. No timestamp tolerance. No replay protection.                                                                                                                                   | Basic signature check                                                          | Telnyx ED25519 verification. Timestamp tolerance. Raw event storage. Idempotency by provider event ID. Asynchronous processing. Dead-letter queues. Replay protection.                                                                          | None                                                                                  | Invalid signatures could be accepted in development (`NODE_ENV !== 'production'`). No replay protection. No dead-letter.       | Implement ED25519 verification, timestamp check, raw event storage, idempotency, async processing, dead-letter, replay protection                            | Security tests (signature verification, replay, idempotency)             |
| Security (Outbound Compliance)     | None                                                                                                                                                                                                                                        | None                                                                           | Consent enforcement (`ConsentRecord`), suppression (`SuppressionEntry`), calling windows, caller-ID validation, rate limiting for campaigns, campaign approval, least-privilege credentials.                                                    | None                                                                                  | Uncontrolled outbound calling. No consent tracking. No suppression. No caller-ID validation.                                   | Implement consent/suppression models, calling window validation, caller-ID checks, campaign approval                                                         | Security (consent/suppression checks), integration (workflow)            |
| Security (Tenant Isolation)        | Workspace isolation exists (`Workspace`, `WorkspaceMember`, `BusinessProfile`). Basic RBAC (`AUTH_SECRET`).                                                                                                                                 | Multi-tenant database isolation                                                | Full isolation for telephony events, concurrent leases, campaigns, agent versions, improvement proposals. No cross-tenant data leakage in logs or analytics.                                                                                    | None                                                                                  | Sensitive business configurations could cross tenants in concurrent processing or analytics aggregation.                       | Ensure all new telephony/campaign/improvement data uses `workspaceId` and is isolated                                                                        | Security (tenant isolation for new modules)                              |
| Database Migration                 | Schema exists. No migration for new telephony models.                                                                                                                                                                                       | Basic schema                                                                   | Safe migrations adding new models without data loss. Idempotent schema updates.                                                                                                                                                                 | None                                                                                  | Migration could corrupt existing data if not handled properly.                                                                 | Create Prisma migrations for new telephony models                                                                                                            | Integration (database integrity)                                         |
| Scripts (Telnyx)                   | None                                                                                                                                                                                                                                        | None                                                                           | `scripts/telnyx/provision.ts`, `verify.ts`, `test-inbound.ts`, `test-outbound.ts`, `test-concurrent.ts`. Idempotent provisioning. Explicit admin flag for number purchase.                                                                      | None                                                                                  | Automatic purchasing of numbers. Running provisioning on every build. Duplicate resources.                                     | Implement scripts with idempotency, admin flags, verification steps                                                                                          | Integration (provisioning runs), security (no automatic purchase)        |
| GitHub Repository Presentation     | Basic `README.md`. Issue templates absent. PR template absent. `CODE_OF_CONDUCT.md` absent. `CONTRIBUTING.md` absent. `SECURITY.md` absent. `CHANGELOG.md` absent. `CODEOWNERS` absent. No Mermaid architecture diagrams showing telephony. | Basic repo structure                                                           | Professional documentation with architecture docs, security docs, setup guides, operation guides, issue/PR templates, changelog, code of conduct, screenshots. Honest capability states.                                                        | None                                                                                  | Fake badges or unsupported claims. Secret values in docs. AI-generated clutter.                                                | Add all required docs, templates, and professional presentation files                                                                                        | Manual verification                                                      |

## 3. DUPLICATE CAPABILITY CHECK

No independent second Telnyx AI assistant exists. No second conversation system exists. The existing `TwilioVoiceProvider` is a stub and must not become the primary telephony provider while ElevenLabs remains primary conversation provider. There is one canonical conversation model (`lib/conversation/`) used by the demo flow. The architecture requires one canonical business-agent configuration deployable to both web and telephone channels.

## 4. SECURITY RISK SUMMARY

- Webhook verification uses generic HMAC instead of Telnyx ED25519. Production mode (`NODE_ENV === 'production'`) blocks invalid signatures but development mode allows invalid ones, which could lead to false confidence.
- No replay protection, no dead-letter queues, no idempotent event storage.
- Feature flags for telephony do not exist; new production features would be enabled by default.
- Environment validation reports errors but returns `rawEnv` even when parsing fails, which could allow missing critical variables in production.
- Sensitive values (API keys, secrets) could be logged by `console.error` in webhook and environment error paths.
- Database encryption is mentioned (`AES-256-GCM`) but the schema uses simple `String` fields for `encryptedCredential`, `encryptedCredential` patterns. Phone numbers in `Call` use `Masked` strings but no search hash or encryption mechanism exists.
- Outbound calling has zero controls (no consent, no suppression, no campaign limits).
- No audit trail specifically for telephony events, concurrent lease changes, or agent deployments.

## 5. REQUIRED ARCHITECTURE CHANGES (HIGH-LEVEL)

Phase 1: Foundation

- Create architecture audit (this document)
- Add server-owned feature flags for all telephony features (default false)
- Update environment validation (`lib/config/env.ts`) with full Telnyx/ElevenLabs/DB/Redis schema
- Create provider readiness matrix and verification logic
- Update database schema with new telephony models (`SipTrunk`, `TelephonyConnection`, `CallConcurrencyLease`, `Campaign`, `CampaignRecipient`, `ConsentRecord`, `SuppressionEntry`, etc.)
- Create documentation plan

Phase 2: Provider Contracts & Call Events

- Create `lib/telephony/contracts/` with provider interfaces
- Implement `TelnyxVoiceProvider` in `lib/telephony/providers/telnyx/`
- Implement webhook verification (ED25519), event normalization, raw event storage, idempotency, async processing
- Implement `CallEvent` normalization mapping

Phase 3: SIP & Inbound Routing

- Configure SIP trunk (`SipTrunk` model and provisioning)
- Implement inbound routing (number -> tenant/business -> agent -> SIP -> conversation)
- Implement concurrent lease management (`CallConcurrencyLease`)
- Implement server-authoritative call state machine (`lib/telephony/call-state-machine/`)

Phase 4: CRM & Finalization

- Update CRM finalization (`CallOutcome`, `CallSummary`, `CallEvent` integration)
- Implement appointment, lead, task, handoff, follow-up finalization
- Create live operations dashboard (`/dashboard/live` improvements)

Phase 5: Controlled Outbound

- Implement campaign system (`Campaign`, `CampaignRecipient`, `OutboundAttempt`)
- Implement consent checks (`ConsentRecord`), suppression (`SuppressionEntry`), calling windows
- Implement queue execution with rate limits and concurrency contracts
- Implement safe opening disclosures and opt-out handling

Phase 6: Concurrent Operations

- Implement concurrent inbound and outbound processing with distributed Redis leases
- Implement inbound reserve logic (reserve capacity for inbound)
- Create concurrent call acceptance test (at least 2 inbound + 2 outbound overlapping)
- Implement live-operations visualization

Phase 7: Multilingual

- Create `LanguageProfile` model and readiness matrix
- Implement language selection strategies (number, contact preference, detection, fallback, human transfer)
- Implement language-specific business content, evaluation cases, and safe fallback
- Verify one additional language beyond English

Phase 8: Supervised Improvement

- Implement evaluation framework (`EvaluationSuite`, `EvaluationRun`)
- Implement observation (`ImprovementObservation`) and proposal (`ImprovementProposal`) workflow
- Implement approval, evaluation, canary, deployment (`AgentDeployment`), rollback (`RollbackRecord`)
- Implement improvement loop UI (`/dashboard/improvement`)

Phase 9: Design & Documentation

- Redesign homepage with professional positioning (inbound/outbound/concurrent)
- Professional product design (light mode, restrained colors, operational tables)
- Complete `README.md`, architecture docs, setup guides, security docs, operation guides
- Add issue/PR templates, changelog, code of conduct, security policy
- Capture screenshots from verified application
- Verify production deployment

## 6. FINAL STATUS

PASS: Only when:

- Telnyx is implemented as a real telephony provider (not mock/stub)
- ElevenLabs remains the canonical conversation provider
- SIP routing works securely (TLS, SRTP, authentication, headers)
- Inbound calls work (verified webhook -> agent -> CRM)
- Approved outbound calls work (verified consent/suppression/window -> agent -> CRM)
- Concurrent inbound and outbound work (verified distributed leases, isolation)
- Multilingual support is capability-based (verified agent/content/voice/evaluation)
- Self-improvement is supervised (approval required, rollback available)
- Tenant isolation holds for new modules
- Tests pass (unit, integration, security, E2E)
- CI passes
- Preview passes
- Production passes
- Repository documentation is current
- Production screenshots are current
- No unsupported claims exist

CURRENT STATUS: PARTIAL (architecture implemented but production telephony requires live provider verification, concurrent call tests, multilingual verification, improvement loop execution, and updated screenshots before PASS)
