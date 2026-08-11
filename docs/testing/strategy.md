# Testing Strategy

| Layer         | Purpose                         | Examples                                                          |
| ------------- | ------------------------------- | ----------------------------------------------------------------- |
| Unit          | Pure domain and policy behavior | state transitions, calling windows, leases, readiness             |
| Integration   | Service and projection behavior | booking, campaign queue, provider inbox, post-call reconciliation |
| Security      | Boundaries and abuse controls   | tenant isolation, tool context, webhook signature, suppression    |
| E2E           | Browser journeys                | routes, demo contract, responsive behavior                        |
| Live provider | Manual, authorized evidence     | owned inbound/outbound numbers and provider correlation           |

The CI suite does not make paid provider calls. Live-provider tests require owned/authorized numbers, configured resources, an isolated customer environment, and a recorded result. A test must not assert fake provider success.

## Customer-operations acceptance

The core non-provider journey is: customer interaction -> tenant/contact resolution -> conversation -> authorized tool -> contact/appointment/opportunity/task/follow-up -> persisted summary and timeline.

The escalation journey is: unresolved or risky support intent -> structured handoff -> human queue/task -> preserved conversation context. A live transfer is complete only after provider confirmation.
