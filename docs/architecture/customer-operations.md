# Customer Operations Architecture

The application keeps channel adapters separate from business capability. Phone, web voice, and web text converge into the Conversation domain. Future email, form, and API adapters should follow the same boundary.

| Capability    | Current domain support                           | Boundary                                         |
| ------------- | ------------------------------------------------ | ------------------------------------------------ |
| Reception     | Conversation, knowledge, contact lookup, routing | Scoped tools and human escalation                |
| Support       | Conversation, knowledge, tasks, handoffs         | Case/Ticket is planned                           |
| Qualification | Leads/opportunities, fields, tasks               | Evidence and policy, not opaque scoring claims   |
| Scheduling    | Availability and appointments                    | Calendar adapter confirmation before success     |
| Follow-up     | Follow-ups, campaigns, preferences               | Consent, suppression, and window controls        |
| Escalation    | Handoff and task state                           | Provider confirmation required for live transfer |

No capability may query arbitrary tenant data or write business state without the server-owned tool boundary.
