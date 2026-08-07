# Outbound Compliance

## Campaign Controls

Every outbound campaign requires:

- Human approval before first production execution (`PENDING_APPROVAL` -> `APPROVED`)
- Consent records (`ConsentRecord`) for each recipient
- Suppression checks (`SuppressionEntry`)
- Calling window validation
- Caller-ID eligibility verification
- Maximum attempts and retry intervals
- Stop conditions
- Voicemail behavior
- Opt-out behavior
- Escalation behavior
- Required CRM outcome

## Disclosure

Outbound opening messages must clearly identify the business and purpose. When required by policy or law, disclose that the caller is an automated voice assistant.

## Opt-Out

Honor opt-out language during the conversation. Immediately suppress future attempts when the recipient requests no further calls.
