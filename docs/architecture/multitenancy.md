# Multitenancy

Every protected request resolves Session → User → WorkspaceMembership → Role → Authorized Workspace → Resource.

Resource IDs never authorize access. Queries include workspace scope, and cross-workspace access returns a non-disclosing not-found or forbidden response. Provider events resolve tenant context from verified server-side routing records, not browser or model claims.

Provider credentials, contact memory, transcripts, recordings, tools, campaigns, evaluation data, and deployment candidates remain tenant-scoped. Demo sessions use a separate signed identity and fictional workspace.
