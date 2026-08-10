# ElevenLabs SIP

ElevenLabs is the canonical realtime conversational layer. Import the Telnyx-backed phone number as an ElevenLabs SIP-trunk phone, configure authenticated TLS/SRTP where supported, assign the verified agent, and store the returned ElevenLabs phone identifier in the tenant's PhoneNumber.voiceProviderPhoneNumberId.

Outbound execution uses `POST /v1/convai/sip-trunk/outbound-call` with the verified agent ID, imported phone ID, destination E.164 number, and VoxDesk correlation dynamic variables. Persist both `conversation_id` and `sip_call_id`.

Configure the signed post-call webhook. Verify the raw body and timestamp before persisting an idempotent ProviderEvent. Reconcile post-call data into the existing Conversation; do not create a second record.
