# Security Overview

VoxDesk protects tenant-scoped customer operations data, provider credentials, outbound calling authority, recordings, transcripts, and deployment controls.

| Threat                  | Primary control                                     | Evidence                               |
| ----------------------- | --------------------------------------------------- | -------------------------------------- |
| BOLA and tenant leakage | Session-to-membership-to-workspace authorization    | Tenant-isolation security tests        |
| Unauthorized tools      | Signed context, schema, role/policy, idempotency    | Tool authorization tests               |
| Webhook forgery/replay  | Raw-body signature, timestamp, event inbox          | Telnyx/ElevenLabs webhook tests        |
| Duplicate side effects  | Persistent execution IDs and operation fingerprints | Appointment/campaign/provider tests    |
| Campaign abuse          | Consent, suppression, windows, attempts, capacity   | Outbound authorization/readiness tests |
| PII exposure            | Encryption/hash/masking controls and safe logs      | Identifier/encryption tests            |

Controls reduce risk; they are not a claim of compliance or absence of vulnerabilities.
