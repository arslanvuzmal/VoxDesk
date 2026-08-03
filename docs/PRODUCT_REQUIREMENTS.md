# VoxDesk AI — Product Requirements Document (PRD)

**Project Name:** VoxDesk AI  
**Project Owner:** Arslan Vuzmal Lone  
**Version:** 1.0.0 Production Release

---

## 1. Product Vision & Goals

VoxDesk AI is a production-grade, multi-tenant AI voice receptionist and call-automation SaaS platform. It enables businesses to deploy intelligent voice agents that answer inbound calls, qualify leads, schedule appointments, handle human escalations, and synchronize records with calendars and CRMs.

---

## 2. Target Persona & User Roles

### Workspace Roles

- **Owner**: Full workspace management, provider configuration, billing, member deletion, audit access.
- **Admin**: Agent configuration, calendar/CRM settings, business knowledge, qualification rules.
- **Operator**: Review calls, respond to human escalations, handle callback queues, update leads.
- **Analyst**: Access call metrics, conversion reports, provider cost estimates.
- **Viewer**: Read-only dashboard view without configuration access or secret viewing privileges.

---

## 3. Core Functional Requirements

### 3.1 Voice Agent Configuration & Business Knowledge

- Configurable agent voice model, language, custom greeting, and operational prompt.
- Business profile configuration: Opening hours, timezones, holiday rules, approved Q&A knowledge base.

### 3.2 Live Call Console & Call Simulation

- Real-time interactive call console featuring audio wave visualization, speaker-separated live transcripts, conversation state badges, and tool execution logs.
- Support for interruption (barge-in), silence detection, and simulated network latency.

### 3.3 Appointment Booking Workflow

- Integrations for Google Calendar, Cal.com, and Demo Calendar.
- Support for slot availability checking, explicit caller confirmation, appointment booking, rescheduling, and cancellation.

### 3.4 Lead Qualification & Scoring Matrix

- Automated scoring across 5 key criteria: Service Fit, Budget, Timeline, Authority, and Urgency.
- Category classification: `HOT`, `WARM`, `REVIEW`, `COLD`.

### 3.5 Human Escalation & Handoff Briefing

- Detection of escalation triggers (caller request, emergency language, low confidence, repeated errors).
- Generation of structured Transfer Brief (caller details, summary, score, unresolved questions, recommended action).

### 3.6 Speaker-Separated Transcripts & Summaries

- Timestamped transcript segments, confidence scores, PII redaction state.
- Zod-validated structured call summary: Intent, Sentiment, Urgency, Action Items, Commitments.

### 3.7 CRM Synchronization & Audit Logs

- Automated contact creation, lead record update, and activity timeline creation.
- Immutable audit log tracking all workspace settings changes and user actions.
