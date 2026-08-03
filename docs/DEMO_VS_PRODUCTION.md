# VoxDesk AI — Sandbox Demo vs. Production Telephony Matrix

**Owner:** Arslan Vuzmal Lone  
**Product:** VoxDesk AI

---

## 1. Feature Matrix: Interactive Sandbox vs Production Telephony

| Feature / Subsystem      | Interactive Sandbox Demo (`/demo`)                   | Production Telephony Deployment               |
| :----------------------- | :--------------------------------------------------- | :-------------------------------------------- |
| **Audio Input Channel**  | Browser Microphone (Web Speech API / Cloudflare STT) | Twilio / Telnyx SIP Trunking & WebSockets     |
| **Audio Output Channel** | Browser WebAudio / ElevenLabs Server Synthesizer     | G.711 / Mulaw 8kHz Audio Streams              |
| **LLM Provider**         | Cloudflare Workers AI (`@cf/moonshotai/kimi-k2.6`)   | Cloudflare / OpenRouter Dedicated Endpoints   |
| **Database Persistence** | Real Prisma PostgreSQL / Demo Memory Store           | Production PostgreSQL (Supabase / AWS Aurora) |
| **CRM Synchronization**  | Internal Voice Lead Inbox (`/dashboard/leads`)       | HubSpot / Salesforce / Webhooks               |
| **Session Control**      | Cookie Vouchers & Turn Limits (10 turns max)         | Unlimited Telephony Minutes & Session Billing |
| **Calendar Integration** | Real Appointment Storage & Availability Check        | Google Calendar / Cal.com / Outlook OAuth     |

---

## 2. Transitioning Sandbox to Enterprise Production

1. Supply Twilio Account SID & Auth Token in `.env`.
2. Connect production database via `DATABASE_URL`.
3. Configure HubSpot / Salesforce CRM OAuth client credentials.
4. Deploy VoxDesk Webhook Worker to process incoming SIP calls.
