# API Catalog

VoxDesk API routes are application boundaries, not a broad public SDK. Stable customer-facing integrations should be versioned and documented separately before being promised.

| Area           | Route family                                           | Auth and side effects                                                           |
| -------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Authentication | `/api/auth/*`                                          | Session lifecycle and account access                                            |
| Conversations  | `/api/conversations/*`                                 | Workspace-scoped conversation read/create paths                                 |
| Voice          | `/api/voice/*`                                         | Authorized browser/agent bootstrap and tool requests                            |
| Telephony      | `/api/telephony/*`                                     | Workspace and campaign-authorized operations; simulation route is authenticated |
| CRM            | `/api/calls`, `/api/leads`, `/api/opportunities`       | Tenant-scoped operational records                                               |
| Scheduling     | `/api/appointments`, `/api/calendar/*`                 | Authorization and provider-confirmed actions                                    |
| Improvement    | `/api/improvement/*`                                   | Permissioned lifecycle gates                                                    |
| Health         | `/api/health/*`                                        | Sanitized readiness only                                                        |
| Webhooks       | `/api/webhooks/telnyx/*`, `/api/webhooks/elevenlabs/*` | Provider signature verification; never browser authorization                    |

All routes must return safe errors and scope workspace-owned resources. See [authentication and authorization](authentication.md), [errors](errors.md), and [webhooks](webhooks.md).
