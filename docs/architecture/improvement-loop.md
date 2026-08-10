# Supervised improvement loop

Conversation finalization can produce deterministic and structured evaluation results. Analysis roles create observations; they cannot change production.

Observation → Proposal → Human approval → Immutable candidate AgentVersion → Required golden-suite runs → Regression gate → Bounded canary → Human promotion → Monitoring → Rollback.

Approval requires a target agent and explicit evaluation-suite IDs. Every suite must have a passing run for the candidate version and zero critical failures. Canary completion requires its configured sample, zero critical failures, and no regression flag. Promotion atomically deactivates the previous production deployment and activates the candidate. Rollback restores the most recent known previous deployment and records actor, reason, and restored version.
