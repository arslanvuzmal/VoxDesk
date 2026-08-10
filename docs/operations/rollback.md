# Rollback

Application rollback and agent-version rollback are separate.

For agent behavior, only a DEPLOYED candidate with a known previous production AgentDeployment can roll back. The operation atomically deactivates the current deployment, restores the most recent verified previous deployment, creates a RollbackRecord, updates the candidate, and appends an audit event.

For application deployment, identify the exact production SHA, review migration compatibility, restore the previous compatible deployment, verify health endpoints and provider webhooks, and record the incident timeline. Never reverse an irreversible database migration without a reviewed recovery plan and backup.
