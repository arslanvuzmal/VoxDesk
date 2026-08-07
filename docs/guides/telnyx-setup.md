# Telnyx Setup Guide

## Environment Variables

Add the following to `.env.local` (never commit real values):

```
TELNYX_API_KEY=""
TELNYX_PUBLIC_KEY=""
TELNYX_CONNECTION_ID=""
TELNYX_OUTBOUND_VOICE_PROFILE_ID=""
TELNYX_PRIMARY_PHONE_NUMBER=""
TELNYX_WEBHOOK_SECRET=""
TELNYX_SIP_USERNAME=""
TELNYX_SIP_PASSWORD=""
TELNYX_SIP_TRUNK_ID=""
```

## Scripts

- `npm run telnyx:provision` - Idempotent provisioning (requires `TELNYX_ADMIN_PROVISION_FLAG=true`)
- `npm run telnyx:verify` - Verify configuration
- `npm run telnyx:test:inbound` - Verify inbound setup
- `npm run telnyx:test:outbound` - Verify outbound setup
- `npm run telnyx:test:concurrent` - Verify concurrent capacity

## Feature Flags

All telephony features default to false. Enable only after provider verification:

```
TELNYX_TELEPHONY_ENABLED=true
TELNYX_INBOUND_ENABLED=true
TELNYX_OUTBOUND_ENABLED=true
OUTBOUND_CAMPAIGNS_ENABLED=true
CALL_RECORDING_ENABLED=false
SUPERVISED_IMPROVEMENT_ENABLED=false
MULTILINGUAL_TELEPHONY_ENABLED=false
```
