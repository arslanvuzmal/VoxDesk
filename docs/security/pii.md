# PII, Recording, and Retention

Contacts, phone numbers, email, transcripts, recordings, and customer context are sensitive operational data. VoxDesk is designed to use encrypted values where needed, HMAC lookup identifiers, masked display values, tenant-scoped queries, and audit trails for sensitive actions.

Routine logs should use correlation IDs and safe metadata rather than raw phone numbers, emails, credentials, or complete transcripts. Recording remains disabled until business policy and consent allow it. Retention, deletion, export, and recording policies must be configured per customer deployment.

Related documents: [recording](recording.md), [retention](data-retention.md), and [outbound compliance](outbound-compliance.md).
