# VoxDesk AI — System Architecture & Component Specification

**Author / Owner:** Arslan Vuzmal Lone  
**Version:** 1.0.0  

---

## 1. High-Level Architecture Overview

VoxDesk AI is architected as a modular Next.js SaaS application structured around multi-tenant isolation, pluggable provider interfaces, a server-enforced conversation state engine, and a deterministic call simulator for demonstration without paid credentials.

```mermaid
graph TD
    Client[Browser / Mobile Client] --> |HTTPS / WSS| NextApp[Next.js App Router]
    
    subgraph "Core SaaS Application"
        NextApp --> Auth[Auth & RBAC Middleware]
        Auth --> WSGuard[Workspace Isolation Scope]
        
        WSGuard --> StateEngine[16-State Conversation Engine]
        WSGuard --> BookingEngine[Calendar & Slot Manager]
        WSGuard --> LeadEngine[Lead Qualification & Scoring]
        WSGuard --> EscalationEngine[Human Transfer & Briefing]
    end
    
    subgraph "Pluggable Provider Abstraction Layer"
        StateEngine --> VoiceAdapters[Voice Providers: Demo / Twilio / Vapi / Retell / LiveKit]
        StateEngine --> STTAdapters[STT Providers: Demo / Deepgram / OpenAI]
        StateEngine --> TTSAdapters[TTS Providers: Demo / ElevenLabs / OpenAI]
        StateEngine --> LLMAdapters[LLM Providers: Demo / OpenAI / Anthropic / Gemini]
        
        BookingEngine --> CalAdapters[Calendar Adapters: Demo / Google Cal / Cal.com]
        WSGuard --> CRMAdapters[CRM Adapters: Demo / HubSpot / Webhook]
    end
    
    subgraph "Persistence Layer"
        WSGuard --> Prisma[Prisma ORM]
        Prisma --> Postgres[(PostgreSQL Database)]
    end
```

---

## 2. Conversation State Machine Lifecycle

VoxDesk AI enforces strict conversation state transitions via a server-side state engine:

```mermaid
stateDiagram-v2
    [*] --> INITIALISING
    INITIALISING --> GREETING
    GREETING --> IDENTIFYING_INTENT
    
    IDENTIFYING_INTENT --> ANSWERING_QUESTION: FAQ / Info Request
    IDENTIFYING_INTENT --> COLLECTING_CONTACT: Service Request
    IDENTIFYING_INTENT --> QUALIFYING_LEAD: Sales Enquiry
    IDENTIFYING_INTENT --> ESCALATING: Human Transfer / Complaint
    
    ANSWERING_QUESTION --> IDENTIFYING_INTENT
    COLLECTING_CONTACT --> CHECKING_AVAILABILITY
    QUALIFYING_LEAD --> CHECKING_AVAILABILITY
    
    CHECKING_AVAILABILITY --> OFFERING_SLOTS
    OFFERING_SLOTS --> CONFIRMING_APPOINTMENT
    CONFIRMING_APPOINTMENT --> SUMMARISING: Confirmed
    CONFIRMING_APPOINTMENT --> OFFERING_SLOTS: Slot Rejected
    
    ESCALATING --> CLOSING: Transfer Complete / Callback Task Created
    SUMMARISING --> CLOSING
    CLOSING --> COMPLETED
    COMPLETED --> [*]
```

---

## 3. Telephony Webhook Security Protocol

```mermaid
sequenceDiagram
    autonumber
    actor Telephony as Telephony Provider (Twilio / Vapi)
    participant Webhook as /api/webhooks/voice
    participant Security as Signature Validator
    participant Dedupe as Idempotency Check
    participant Engine as Conversation Engine
    participant DB as PostgreSQL

    Telephony->>Webhook: POST /api/webhooks/voice (X-Signature, Payload)
    Webhook->>Security: Verify SHA-256 HMAC Signature
    alt Invalid Signature
        Security-->>Webhook: 401 Unauthorized
        Webhook-->>Telephony: Return 401
    else Valid Signature
        Webhook->>Dedupe: Check Event ID in Redis/DB
        alt Duplicate Event
            Dedupe-->>Webhook: Event Already Processed
            Webhook-->>Telephony: Return 200 OK (Idempotent)
        else Fresh Event
            Dedupe->>Engine: Process Event (Speaker, Interruption, State)
            Engine->>DB: Persist Event & Update Call State
            Engine-->>Webhook: Return Execution Response
            Webhook-->>Telephony: Return TwiML / Provider Instruction
        end
    end
```
