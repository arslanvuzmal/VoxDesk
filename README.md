# VOXDESK AI

**VoxDesk AI is a configurable voice receptionist platform that answers enquiries, qualifies leads, books appointments and gives operators a complete record of every conversation.**

![Honest Badges](https://img.shields.io/badge/Status-100%25%20Functional%20SaaS-emerald?style=for-the-badge)
![Demo Badge](https://img.shields.io/badge/Demo%20Mode-0%20Credentials%20Required-teal?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Author](https://img.shields.io/badge/Project%20Owner-Arslan%20Vuzmal%20Lone-navy?style=for-the-badge)

---

## Live Demo & Guided Story

- **Live Production Application:** [https://voxdesk-ai.vercel.app](https://voxdesk-ai.vercel.app)
- **Interactive Live Call Console:** [https://voxdesk-ai.vercel.app/demo](https://voxdesk-ai.vercel.app/demo)
- **1-Minute Guided Client Story:** [https://voxdesk-ai.vercel.app/demo/story](https://voxdesk-ai.vercel.app/demo/story)

### Demo Credentials
- **Owner Email:** `owner@northstarlegal.com`
- **Password:** `password123`
- **Demo Workspace:** `Northstar Legal Consultations` (Fictional Demonstration Workspace)

---

## Business Problem & Product Solution

### The Problem
Small and mid-sized service businesses (law firms, medical clinics, real-estate agencies, home service contractors) lose up to 35% of inbound sales leads and booking requests due to unanswered calls, after-hours voicemails, or staff unavailability.

### The Solution
VoxDesk AI deploys an intelligent, multi-tenant AI voice receptionist that:
- Answers inbound calls 24/7 with custom greetings and approved business knowledge.
- Qualifies prospective clients using BANT / CHAMP lead scoring matrices.
- Checks calendar availability (Google Calendar, Cal.com, Demo) and confirms appointments.
- Detects emergency or complex requests and transfers calls with structured Transfer Briefings.
- Generates speaker-separated transcripts, Zod-validated summaries, and CRM engagement logs.

---

## 6 Key Client WOW Demonstrations

1. **Live Call Console**: Real-time audio waveform visualizer, speaker-separated live transcript stream, state transition badges, and turn-by-turn simulation.
2. **Appointment Scheduling**: Queries real-time calendar availability, presents non-conflicting slots, obtains explicit confirmation, and dispatches invites.
3. **BANT Lead Qualification**: Evaluates service scope, budget, timeline, authority, and urgency to output HOT, WARM, REVIEW, or COLD scoring breakdowns.
4. **Human Escalation**: Identifies dissatisfaction or emergency phrases, pauses automation, and creates context-rich Transfer Briefings for human operators.
5. **Call Intelligence**: Computes sentiment, urgency, commitments, and action items validated with Zod schemas.
6. **Guided Client Story**: Interactive 10-step client trajectory demonstrating full inbound call lifecycle in 60 seconds.

---

## System Architecture & Technology Stack

```
           +-------------------------------------------------------+
           |                 Browser / Client UI                   |
           +-------------------------------------------------------+
                                       |
                                       v
           +-------------------------------------------------------+
           |              Next.js 15 App Router                    |
           |          Auth.js Sessions & Server RBAC               |
           +-------------------------------------------------------+
                                       |
           +---------------------------+---------------------------+
           |                                                       |
           v                                                       v
+-----------------------+                              +-----------------------+
| 16-State State Engine |                              |  Pluggable Adapters   |
| Server-Enforced Rules |                              |  Voice / STT / TTS /  |
+-----------------------+                              |  Calendar / CRM       |
           |                                           +-----------------------+
           v                                                       |
+------------------------------------------------------------------+
|                   Prisma ORM & PostgreSQL                        |
|            Multi-Tenant Isolation via workspaceId                |
+------------------------------------------------------------------+
```

### Stack Components
- **Framework:** Next.js 15 (App Router), React 19, Strict TypeScript
- **Styling:** Tailwind CSS, custom Deep Navy & Teal design system
- **Database:** PostgreSQL (Supabase Compatible) with Prisma ORM (22 Relational Models)
- **Security:** AES-256-GCM Credential Encryption, HMAC SHA-256 Webhook Verification, HTTP-only Cookie Sessions, Workspace RBAC
- **Testing:** Vitest (Unit & Security), Playwright (E2E), TSX Verification Scripts

---

## Local Setup & Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/arslanvuzmal/voxdesk-ai.git
cd voxdesk-ai
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Install Dependencies & Generate Prisma Client
```bash
npm install
npx prisma generate
```

### 4. Database Setup & Seeding
```bash
npm run db:up         # Optional Docker PostgreSQL
npm run db:migrate    # Apply database migrations
npm run db:seed       # Seed fictional 'Northstar Legal' workspace
```

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verification & Testing Commands

```bash
npm run format:check      # Prettier formatting verification
npm run lint              # ESLint code audit
npm run typecheck         # TypeScript strict mode check
npm run test              # Vitest unit, security & integration tests
npm run demo:verify       # Deterministic demo state verification
npm run build             # Next.js production build verification
```

---

## Security, Privacy & Production Hardening

- **Multi-Tenant Scoping:** Every database query includes mandatory `workspaceId` filtering.
- **Credential Protection:** Provider API keys are encrypted at rest with AES-256-GCM and never returned to browser bundles.
- **Webhook Security:** Telephony webhooks verify provider signatures and enforce idempotency.
- **Privacy Masking:** Phone numbers and email addresses are masked in logs and public UI views.
- **Jurisdiction Notice:** Production deployment must be reviewed against privacy, recording, telemarketing, and industry rules applicable to the client's jurisdiction and use case.

---

## Known Limitations & Production Roadmap

- **Demo Telephony:** Demo Voice Provider operates deterministically in browser/server without paid credentials. Live PSTN calling requires Twilio/Vapi credentials.
- **Realtime WebSockets:** High-volume WebRTC media streaming for >10,000 concurrent calls recommends dedicated LiveKit cluster deployment.

---

## License & Project Ownership

This project is licensed under the MIT License.

**Project Owner & Developer:** Arslan Vuzmal Lone  
**GitHub Account:** [arslanvuzmal](https://github.com/arslanvuzmal)  
**Repository:** [arslanvuzmal/voxdesk-ai](https://github.com/arslanvuzmal/voxdesk-ai)
