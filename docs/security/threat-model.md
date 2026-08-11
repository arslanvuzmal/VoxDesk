# Threat Model

| Threat                              | Boundary                        | Primary control                                                            | Test/evidence                               | Residual risk                                      |
| ----------------------------------- | ------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------- |
| Broken authentication/session theft | Browser to application          | HttpOnly session handling, server validation, rotation/invalidation design | Session and tenant tests                    | Deployment cookie configuration must be reviewed.  |
| BOLA/tenant leakage                 | Route/service to workspace data | Membership and workspace-scoped queries; non-disclosing failures           | Tenant isolation tests                      | New routes require the same discipline.            |
| Tool injection                      | Agent/browser to tool gateway   | Signed context, schemas, policy, idempotency                               | Tool context/authorization tests            | Policy coverage must grow with tools.              |
| Webhook forgery/replay              | Provider to webhook             | Raw-body signature, timestamp bounds, event ID inbox                       | Telnyx/ElevenLabs webhook tests             | Provider key rotation and delivery monitoring.     |
| SSRF                                | Custom outbound integration     | Destination validation and safe adapter restrictions                       | Security review/tests where adapter enabled | DNS/redirect behavior requires ongoing review.     |
| XSS/PII leakage                     | Transcript/UI/logging           | Escaped rendering, masking, safe logs, retention policy                    | Route/security review                       | Customer-configured content can be risky.          |
| Recording/consent failure           | Call policy to provider         | Explicit recording state and policy gates                                  | Recording policy tests                      | Jurisdiction/business policy is customer-specific. |
| Campaign/cost abuse                 | Operator to outbound execution  | Consent, suppression, windows, attempts, capacity, approvals               | Campaign/outbound tests                     | Provider and plan limits vary.                     |
| Duplicate/race side effects         | Webhooks/jobs/tools             | Event identities, execution IDs, transactions, leases                      | Provider/appointment/campaign tests         | Reconciliation requires operational monitoring.    |
| Dependency compromise               | Build supply chain              | Lockfile, Dependabot, dependency review, owner settings                    | CI and repository settings                  | Alerts need maintainer response.                   |

Security testing reduces known risk; it is not a statement of compliance or zero vulnerabilities.
