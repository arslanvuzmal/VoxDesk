# Graph Report - C:\Users\laptopzone\voxdesk-ai (2026-08-07)

## Corpus Check

- cluster-only mode — file stats not available

## Summary

- 933 nodes · 1552 edges · 90 communities (67 shown, 23 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `35f915d9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- route.ts
- store.ts
- index.ts
- CalendarAppointmentRecord
- CRMContactRecord
- navbar.tsx
- legal.ts
- training-pack.ts
- scripts
- demo-api.ts
- UnavailableProductionStore
- IDemoSessionStore
- dependencies
- factory.ts
- compilerOptions
- demo-verify.ts
- RedisDemoSessionStore
- devDependencies
- MemoryDemoSessionStore
- VoiceProvider
- cloudflare-ai.test.ts
- agent-registry.server.ts
- session-token.ts
- LiveKitVoiceProvider
- RetellVoiceProvider
- TwilioVoiceProvider
- ConversationStateMachine
- TelephonyCallRecord
- VapiVoiceProvider
- VoiceAgentConfig
- route.ts
- index.ts
- package.json
- agent-registry.client.ts
- getVoiceProvider
- page.tsx
- elevenlabs-voice-controller.tsx
- audit-routes.ts
- index.ts
- page.tsx
- layout.tsx
- business-outcome-receipt.tsx
- middleware.ts
- seed.ts
- .eslintrc.json
- next.config.ts
- next-env.d.ts
- postcss.config.mjs
- tailwind.config.ts

## God Nodes (most connected - your core abstractions)

1. `scripts` - 30 edges
2. `IDemoSessionStore` - 24 edges
3. `RedisDemoSessionStore` - 24 edges
4. `VoiceProvider` - 24 edges
5. `MemoryDemoSessionStore` - 23 edges
6. `UnavailableProductionStore` - 23 edges
7. `getDemoSessionFromCookieToken()` - 22 edges
8. `TelephonyCallRecord` - 22 edges
9. `getOrganizationProfile()` - 21 edges
10. `env` - 18 edges

## Surprising Connections (you probably didn't know these)

- `DashboardLayout()` --calls--> `validateSession()` [EXTRACTED]
  app/(dashboard)/dashboard/layout.tsx → lib/auth/index.ts
- `GET()` --calls--> `validateSession()` [EXTRACTED]
  app/api/auth/me/route.ts → lib/auth/index.ts
- `POST()` --calls--> `getCalendarProvider()` [EXTRACTED]
  app/api/calendar/availability/route.ts → lib/calendar/factory.ts
- `POST()` --calls--> `getCalendarProvider()` [EXTRACTED]
  app/api/calendar/book/route.ts → lib/calendar/factory.ts
- `POST()` --calls--> `getDemoSessionFromCookieToken()` [EXTRACTED]
  app/api/demo/action/confirm-appointment/route.ts → lib/demo/session.ts

## Import Cycles

- None detected.

## Communities (90 total, 23 thin omitted)

### Community 0 - "route.ts"

Cohesion: 0.05
Nodes (58): POST(), AvailableSlot, getAvailableSlots(), assertNever(), BusinessActionRequest, BusinessActionResult, executeBusinessAction(), ActionPolicyContext (+50 more)

### Community 1 - "store.ts"

Cohesion: 0.07
Nodes (40): POST(), POST(), POST(), POST(), POST(), SessionStartSchema, GET(), POST() (+32 more)

### Community 2 - "index.ts"

Cohesion: 0.05
Nodes (29): LoginSchema, POST(), POST(), GET(), POST(), RegisterSchema, DashboardLayout(), iconMap (+21 more)

### Community 3 - "CalendarAppointmentRecord"

Cohesion: 0.09
Nodes (10): POST(), POST(), CalComProvider, DemoCalendarProvider, getCalendarProvider(), GoogleCalendarProvider, AppointmentCreateInput, AvailableSlot (+2 more)

### Community 4 - "CRMContactRecord"

Cohesion: 0.10
Nodes (10): POST(), DemoCRMProvider, getCRMProvider(), HubSpotCRMProvider, CRMActivityInput, CRMContactInput, CRMContactRecord, CRMProvider (+2 more)

### Community 5 - "navbar.tsx"

Cohesion: 0.08
Nodes (13): ElevenLabsVoiceController, TEMPLATES, metadata, metadata, metadata, GuidedClientStory(), storySteps, ImpactEstimator() (+5 more)

### Community 6 - "legal.ts"

Cohesion: 0.10
Nodes (25): POST(), ToolExecutionSchema, ActionDecision, evaluateSuggestedAction(), PendingConfirmation, AppointmentSlot, generateRealAvailableSlots(), formatMaskedPhoneNumber() (+17 more)

### Community 7 - "training-pack.ts"

Cohesion: 0.06
Nodes (36): AppointmentPolicy, AppointmentPolicySchema, ApprovedKnowledgeEntry, ApprovedKnowledgeEntrySchema, BusinessIdentity, BusinessIdentitySchema, BusinessLocation, BusinessLocationSchema (+28 more)

### Community 8 - "scripts"

Cohesion: 0.07
Nodes (30): scripts, audit:routes, build, db:down, db:migrate, db:migrate:deploy, db:seed, db:studio (+22 more)

### Community 9 - "demo-api.ts"

Cohesion: 0.12
Nodes (23): ConsoleState, ElevenLabsVoiceConsoleContent(), ElevenLabsVoiceConsoleProps, MeasuredTelemetry, VoiceTranscriptLine, ConsoleVisibleState, RealVoiceConsole(), RealVoiceConsoleProps (+15 more)

### Community 12 - "dependencies"

Cohesion: 0.10
Nodes (21): dependencies, bcryptjs, clsx, cookie, date-fns, @elevenlabs/client, @elevenlabs/elevenlabs-js, @elevenlabs/react (+13 more)

### Community 13 - "factory.ts"

Cohesion: 0.21
Nodes (3): CallStartOptions, ProviderHealth, WebhookEventPayload

### Community 14 - "compilerOptions"

Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 15 - "demo-verify.ts"

Cohesion: 0.17
Nodes (11): GET(), createTransferBrief(), detectEscalationTrigger(), EscalationContextInput, HumanTransferBrief, LeadCategory, DEMO_SCENARIOS, DemoScenario (+3 more)

### Community 17 - "devDependencies"

Cohesion: 0.11
Nodes (18): devDependencies, autoprefixer, eslint, eslint-config-next, @playwright/test, postcss, prettier, prisma (+10 more)

### Community 20 - "cloudflare-ai.test.ts"

Cohesion: 0.23
Nodes (8): getDeterministicRoutineAnswer(), NORTHSTAR_LEGAL_KNOWLEDGE, RoutineQA, CloudflareStructuredOutput, CloudflareStructuredOutputSchema, checkCloudflareSessionSttLimit(), checkCloudflareSessionTtsLimit(), CloudflareUsageTracker

### Community 21 - "agent-registry.server.ts"

Cohesion: 0.31
Nodes (7): GET(), GET(), AgentRegistration, isElevenLabsConfigured(), resolveElevenLabsAgent(), SupportedLanguage, VoxDeskPreset

### Community 22 - "session-token.ts"

Cohesion: 0.36
Nodes (7): POST(), POST(), VoiceTranscriptLine, DemoSessionPayload, getSessionSecret(), signDemoSessionToken(), verifyDemoSessionToken()

### Community 26 - "ConversationStateMachine"

Cohesion: 0.27
Nodes (4): ConversationState, ConversationStateMachine, STATE_CONFIGS, StateConfig

### Community 31 - "route.ts"

Cohesion: 0.43
Nodes (4): LiveKitTokenSchema, POST(), generateLiveKitRoomToken(), LiveKitTokenOptions

### Community 32 - "index.ts"

Cohesion: 0.57
Nodes (5): decryptText(), encryptText(), getKey(), maskEmail(), maskPhoneNumber()

### Community 33 - "package.json"

Cohesion: 0.29
Nodes (6): author, description, license, name, private, version

### Community 34 - "agent-registry.client.ts"

Cohesion: 0.33
Nodes (3): AgentRegistration, SupportedLanguage, VoxDeskPreset

### Community 35 - "getVoiceProvider"

Cohesion: 0.60
Nodes (3): POST(), POST(), getVoiceProvider()

### Community 37 - "elevenlabs-voice-controller.tsx"

Cohesion: 0.40
Nodes (3): CallState, FinalizationResult, VoiceTranscriptLine

### Community 38 - "audit-routes.ts"

Cohesion: 0.50
Nodes (4): checkUrl(), RouteCheck, routesToAudit, runAudit()

## Knowledge Gaps

- **213 isolated node(s):** `extends`, `KnowledgeSourceItem`, `TEMPLATES`, `metadata`, `metadata` (+208 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `RedisDemoSessionStore` connect `RedisDemoSessionStore` to `store.ts`, `IDemoSessionStore`, `.countActiveSessions`, `.getSession`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `IDemoSessionStore` connect `IDemoSessionStore` to `RedisDemoSessionStore`, `store.ts`, `MemoryDemoSessionStore`, `UnavailableProductionStore`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `UnavailableProductionStore` connect `UnavailableProductionStore` to `store.ts`, `IDemoSessionStore`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `extends`, `KnowledgeSourceItem`, `TEMPLATES` to the rest of the system?**
  _214 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `route.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05355276907001045 - nodes in this community are weakly interconnected._
- **Should `store.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06964006259780908 - nodes in this community are weakly interconnected._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0519774011299435 - nodes in this community are weakly interconnected._
