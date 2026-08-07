# Incident Response

For telephony incidents:

1. Verify provider readiness (`npm run telnyx:verify`)
2. Check webhook delivery status and event reconciliation
3. Verify concurrent lease status (`CallConcurrencyLease`)
4. Check call state machine for invalid transitions
5. Verify tenant isolation (no cross-tenant data leakage)
6. Review audit logs (`AuditLog`)
7. Check feature flags to disable affected capabilities safely

Never disable all features without verifying which feature flag controls the failing component.
