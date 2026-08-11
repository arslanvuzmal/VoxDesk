# Repository Professionalization Audit

**Audited branch:** `codex/voxdesk-finalization` at `7581709`

**Default branch at audit time:** `main` at `c530319`
**Scope:** repository presentation, documentation, GitHub governance, delivery controls, and developer experience. This is a read-only audit; it does not claim live provider verification.

## Current state

`codex/voxdesk-finalization` is the meaningful implementation branch. It is ahead of `main`, contains the canonical Conversation migration, Telnyx event ingestion, ElevenLabs post-call reconciliation, outbound controls, supervised improvement lifecycle, and explicit simulation/live telephony boundary. PR #4 targets `main`; its latest GitHub Actions CI and Vercel Preview checks were successful at the time of audit.

## Strengths

| Area                   | Evidence                                                                                        | Assessment                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Canonical conversation | `Conversation`, messages, fields, tools, correlations, and migration files in `prisma/`         | Strong domain direction; phone and web channels converge without pretending web activity is PSTN. |
| Telephony boundary     | `lib/telephony/contracts`, Telnyx provider, event inbox, outbound executor, simulation provider | Clear provider responsibility and simulation/live separation.                                     |
| Tool safety            | `lib/security/conversation-context.ts`, `lib/voice-agent/tool-executor.ts`, security tests      | Server-owned, scoped context and persisted tool execution are present.                            |
| Tenant controls        | `lib/auth`, `lib/permissions`, tenant-isolation tests                                           | Workspace-scoped authorization is implemented and tested.                                         |
| Outbound controls      | campaign readiness, calling window, lease, recipient and authorization tests                    | The repository models controlled operational calling rather than arbitrary browser dialing.       |
| Quality lifecycle      | `lib/improvement/lifecycle.ts` and lifecycle tests                                              | Promotion, canary, and rollback are designed as supervised gates.                                 |
| Test coverage shape    | 24 unit, 9 integration, 25 security, and browser test files                                     | The test pyramid is substantially stronger than a demo-only repository.                           |

## Findings and remediation

| Priority | Finding | Evidence | Remediation |
| --- | --- | --- |
| High | Root `ARCHITECTURE_AUDIT.md` claims Telnyx, campaigns, improvement, and telephony state machinery do not exist. | It describes commit `35f915d` and conflicts with current code and migrations. | Retire it from the root in favor of durable architecture and audit documentation. |
| High | Several current docs still describe Cloudflare, OpenRouter, Twilio, Supabase, and browser fallbacks as the product path. | `docs/PROVIDER_COST_CONTROLS.md`, `PUBLIC_DEMO_ABUSE_MODEL.md`, `SCALING_AND_CAPACITY.md`, marketing/status pages, legacy providers. | Clarify canonical Telnyx + ElevenLabs ownership, mark isolated legacy paths, and remove unsupported operational claims. |
| High | `graphify-out/` is tracked generated analysis/cache output. | Tracked cache JSON, graph HTML, manifests, and reports. | Ignore and remove after confirming it is generated-only; do not remove source or migrations. |
| Medium | Documentation is fragmented and many architecture documents are short stubs. | `docs/architecture/*`, guides, operations, and security folders. | Add a documentation portal, ADRs, API catalog, operational runbooks, testing strategy, and customer-operations product documentation. |
| Medium | Repository community/governance files are missing. | No `CONTRIBUTING.md`, `SECURITY.md`, `SUPPORT.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md`, `ROADMAP.md`, templates, CODEOWNERS, or Dependabot configuration. | Add focused, solo-maintainer-appropriate files and issue forms. |
| Medium | CI is a single sequential job with broad default permissions and no cancellation policy. | `.github/workflows/ci.yml`. | Split independent validation/test/build work, add minimal permissions, timeouts, concurrency, and a separate dependency-review workflow. |
| Medium | Environment example is short and does not describe security, runtime, preview, and live-only variables. | `.env.example`. | Group variables and link to an environment reference without publishing values. |
| Medium | Legacy runtime configuration supplied predictable placeholder values for several security-critical keys. | `lib/config/env.ts`, `lib/encryption/index.ts`, and the demo-reset route. | Reject missing or placeholder production secrets, remove route/key fallbacks, and keep local simulation behavior explicit. |
| Medium | Public feature claims and product labels are inconsistent with current scope. | README uses “Voice Operations Platform”; repository metadata says “AI voice receptionist SaaS.” | Position VoxDesk as AI customer operations infrastructure, with an explicit implemented/configured/simulated/activation-required vocabulary. |
| Low | Legacy provider packages/routes remain in the tree. | `lib/voice/providers/*`, Cloudflare/OpenRouter code, legacy route references. | Do not remove in this pass; classify them as legacy/isolated and schedule a separately tested retirement. |
| Low | Browser test execution can be contaminated by another application already using port 3000 locally. | Prior Playwright execution received Atlas application content from port 3000. | Document isolated E2E execution and preserve CI's reviewed build path. |

## Repository hygiene

- `.env.local`, build output, test artifacts, and `node_modules` are ignored.
- `graphify-out/` is committed despite being generated output and should be removed from version control.
- A path-only secret scan found fixtures, CI validation values, and generated cache matches. No raw production credential is asserted by this audit. Any credential pasted into chat or placed outside ignored local environment files must be rotated.
- Existing local `*.log` files are untracked and will be preserved.

## Customer-operations gap assessment

The existing system already supports the operational spine: contacts, conversations, calls, appointments, leads/opportunities, tasks, follow-ups, handoffs, campaigns, consent/suppression controls, evaluation, and supervised improvement. A first-class support Case/Ticket domain, human queues/assignment, SLA policies, email/form adapters, and a unified human inbox are not verified as implemented. They should remain documented roadmap capabilities until deliberately introduced with migrations and acceptance tests.

## Prioritized remediation

1. Establish a truthful documentation portal and repository landing page.
2. Add contribution, security, release, issue, PR, ownership, and dependency-update governance.
3. Harden CI workflow structure and document repository/ruleset settings that require owner action.
4. Remove generated repository artifacts and correct stale product/provider documentation.
5. Document customer-operations evolution, API/error conventions, provider boundaries, failure modes, and test strategy.
6. Preserve current application architecture; schedule legacy provider retirement as a separate implementation change.
