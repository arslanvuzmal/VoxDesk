# Activate live Telnyx telephony

## Prerequisites

- Customer-owned Telnyx account and billing authorization
- Owned, authorized test numbers
- ElevenLabs conversational agent
- VoxDesk database and production URL

## Setup

1. Create a Telnyx Voice API application.
2. Configure the signed webhook URL: `https://<application-url>/api/webhooks/telnyx/voice`.
3. Configure the failover webhook according to the Telnyx deployment plan.
4. Record `TELNYX_CONNECTION_ID` and set `TELNYX_PUBLIC_KEY` for signature verification.
5. Purchase or attach the customer's number; set `TELNYX_PRIMARY_PHONE_NUMBER` in E.164 format.
6. Create an outbound voice profile when outbound workflows are required; set `TELNYX_OUTBOUND_VOICE_PROFILE_ID`.
7. Import the SIP number in ElevenLabs and assign the intended `ELEVENLABS_AGENT_ID`.
8. Configure the signed ElevenLabs post-call webhook.
9. Set `TELEPHONY_MODE=live` only after all values are configured.

## Required environment variables for live PSTN

```text
DATABASE_URL
APP_URL
ELEVENLABS_API_KEY
ELEVENLABS_AGENT_ID
TELNYX_API_KEY
TELNYX_PUBLIC_KEY
TELNYX_CONNECTION_ID
TELNYX_PRIMARY_PHONE_NUMBER
TELNYX_OUTBOUND_VOICE_PROFILE_ID
```

Webhook secrets and application security secrets remain required by their respective
routes. Never commit them or send them in browser requests.

## Verification

1. Inspect `/api/health/telephony`; it must report `mode: LIVE` and readiness appropriate to the provider checks.
2. Validate an inbound call from an owned test number.
3. Validate a consented requested-callback outbound call to an owned test number.
4. Verify the same Conversation, Call, tool executions, and CRM records are correlated.
5. Test signature rejection and duplicate provider-event handling.

## Rollback

Set `TELEPHONY_MODE=simulation` and redeploy. This disables live call execution;
it does not delete provider records or CRM history. Revoke or rotate provider
credentials if a credential exposure is suspected.

## Troubleshooting

- **Provider configured, not live:** check the number, public webhook key, outbound profile, and ElevenLabs SIP import.
- **Webhook rejected:** verify the raw-body signature configuration and clock tolerance; never bypass signature validation.
- **Outbound call blocked:** inspect consent, suppression, calling-window, campaign approval, caller-ID, and capacity controls.
