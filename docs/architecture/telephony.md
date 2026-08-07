# Telephony Architecture

Owner: VoxDesk Architecture Team
Provider: Telnyx (primary telephony provider)
Conversation Provider: ElevenLabs (canonical agent provider)

## Overview

VoxDesk uses Telnyx as the primary telephony provider for inbound and outbound telephone operations. ElevenLabs remains the canonical conversation provider for both web and telephone channels.

## SIP Trunk

- Provider: Telnyx SIP trunk
- Security: TLS signaling where supported; SRTP or required media encryption where supported; digest authentication
- Headers: X-VoxDesk-Call-ID, X-VoxDesk-Tenant-ID, X-VoxDesk-Business-ID, X-VoxDesk-Contact-ID, X-VoxDesk-Campaign-ID, X-VoxDesk-Direction, X-VoxDesk-Language
- No secrets or personal sensitive data placed in SIP headers (opaque identifiers only)

## Call State Machine

States: CREATED, QUEUED, INITIATING, RINGING, ANSWERED, AGENT_CONNECTING, ACTIVE, HUMAN_TRANSFER_PENDING, HUMAN_CONNECTED, ENDING, COMPLETED, BUSY, NO_ANSWER, VOICEMAIL, REJECTED, CANCELLED, FAILED

Server-authoritative. Every provider event stored as an immutable event before applying state transitions.

## Webhook Security

- Telnyx ED25519 signature verification
- Timestamp tolerance (5 minutes)
- Idempotency by provider event ID
- Raw event storage before acknowledgment
- Asynchronous business logic processing
- Replay protection and dead-letter queues
