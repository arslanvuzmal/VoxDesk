# Provider Readiness

The provider readiness matrix (`lib/telephony/provider-readiness.ts`) verifies actual configuration state for:

- Web Voice (`ELEVENLABS`)
- Inbound Telephony (`TELNYX`)
- Outbound Telephony (`TELNYX`)
- Persistence (`POSTGRESQL`, `UPSTASH_REDIS`)

Status values: `configured` (variables present), `verified` (real safe check passed, currently set equal to configured for safety until full live checks are implemented), `provider` name, `message` (honest capability description).

Never display "Live" based only on environment variables.
