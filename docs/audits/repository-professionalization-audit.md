# Repository Professionalization Audit

**Audit date:** 2026-08-12  
**Source branch:** `codex/repository-final-polish`  
**Hardening baseline:** `main` at `0e48997c82b38599eddbf15aa0b7db5c28c8641a`  
**Scope:** repository structure, product claims, architecture documentation, GitHub controls, CI, security boundaries, tests, and developer experience.

This audit does not claim a Vercel deployment or live provider verification. Deployment is deliberately deferred until the repository change is merged and re-verified.

## Discovery snapshot

- The default branch is `main`.
- The current architecture includes canonical conversations, provider-neutral call state, Telnyx and simulation telephony providers, ElevenLabs boundaries, tenant authorization, server-owned tools, outbound controls, CRM state, and supervised improvement.
- The repository contains more than 450 tracked source, test, migration, workflow, and documentation files.
- Community files, issue forms, pull-request guidance, CODEOWNERS, Dependabot, ADRs, runbooks, and a documentation portal are present.
- The public portfolio contract distinguishes simulation from live provider activation.

## Strengths

- Phone, web voice, and web text converge on a canonical `Conversation` domain.
- Telnyx owns PSTN/SIP transport, ElevenLabs owns realtime conversation behavior, and VoxDesk owns authorization and business state.
- Simulation uses explicit simulation identifiers and does not enter through public provider webhooks.
- Tool execution is server-authorized and tenant-scoped.
- Provider events and side-effect tools use idempotency controls.
- Outbound policy includes approval, consent, suppression, calling windows, attempts, readiness, and capacity.
- The quality lifecycle is supervised: proposals cannot silently mutate production behavior.
- Unit, integration, security, build, and browser suites run independently in CI.

## Findings closed in this pass

1. Dependabot had introduced duplicated and unpinned setup actions into CI. The workflow now uses one immutable checkout and Node setup action per job.
2. Dependency review now has explicit least-privilege permissions, concurrency control, and an immutable action SHA.
3. Formatting drift blocked repository validation. Canonical Prettier output was restored.
4. A contact tenant-isolation test mocked an obsolete authorization helper. It now exercises the current permission boundary.
5. The route audit depended on a deleted Vercel URL. It now audits source pages and redirects by default; remote smoke checks require an explicit `AUDIT_BASE_URL`.
6. Public copy contained stale provider claims, mojibake, and voice-receptionist-only positioning. Current copy uses the AI customer operations scope and accurate Telnyx/ElevenLabs responsibilities.
7. The repository linked to a deleted deployment. The link was removed until a deployment is verified.
8. Browser response-security headers were absent. A tested CSP, permissions policy, framing protection, referrer policy, HSTS, MIME protection, and opener policy now apply to all routes.

## Repository hygiene and secret review

- Generated build output, local environment files, test artifacts, caches, and dependencies are ignored.
- A path/content scan did not identify a tracked production credential. Test database URLs and CI-only validation values remain clearly scoped fixtures.
- Secret values previously pasted into chat are outside this repository audit and should be rotated before any deployment.
- No source, migration history, or customer data was deleted in this pass.

## Remaining technical debt

- Legacy Cloudflare, OpenRouter, LiveKit, Twilio, Vapi, and Retell adapters remain isolated but tracked. Removing them safely requires a dedicated dependency and route-retirement change.
- ESLint exits successfully with no errors but reports 287 pre-existing warnings, concentrated in legacy adapters, scripts, fixtures, and unused compatibility parameters. They are not suppressed; they remain visible debt.
- Live Telnyx, ElevenLabs SIP, Redis, CRM, calendar, migration, and production acceptance require a configured target environment and authorized provider resources.
- First-class support cases, human queues, SLA enforcement, email/form adapters, and a unified human inbox remain roadmap capabilities.

## Prioritized next actions

1. Merge only after all GitHub Actions and pull-request checks pass.
2. Create a fresh Vercel project from the exact merged SHA.
3. Configure environment variables without committing values.
4. Apply reviewed migrations and run deployment/database/health smoke checks.
5. Verify simulation and web flows before considering authorized provider tests.
6. Retire legacy providers and eliminate lint warnings in separately reviewable changes.
