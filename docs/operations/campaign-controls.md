# Campaign Controls

Campaign states:

`DRAFT` -> `PENDING_APPROVAL` -> `APPROVED` -> `SCHEDULED` -> `RUNNING` -> `PAUSED` / `COMPLETED` / `CANCELLED` / `FAILED`

Every campaign must define:

- Business purpose
- Lawful basis or consent category
- Target audience
- Allowed countries
- Allowed time window
- Allowed caller ID
- Agent version
- Approved opening disclosure
- Maximum attempts
- Retry interval
- Stop conditions
- Voicemail behavior
- Opt-out behavior
- Escalation behavior
- Required CRM outcome

Dry-run reports include: total recipients, invalid numbers, missing consent, suppressed contacts, unsupported countries, outside calling window, expected call volume, estimated provider cost, required concurrency, selected agent and language coverage.
