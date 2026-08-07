# Data Retention

## Recording

Recording must be configurable per tenant, business, jurisdiction, workflow, and direction. `CALL_RECORDING_ENABLED` defaults to false.

Before recording, apply business policy, disclosure requirements, consent requirements, and jurisdiction configuration.

Recording metadata is stored separately. Access uses signed short-lived URLs. Retention policies and deletion/redaction workflows are supported.

## Transcripts

Transcripts and complete phone numbers are protected. Full transcripts are not included in general analytics logs. Only metadata and redacted summaries are used for analytics.
