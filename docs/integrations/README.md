# Integrations

| Integration                         | Role                                                    | Repository state                                                                     |
| ----------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| ElevenLabs                          | Realtime conversational interaction and post-call data  | Implemented; configuration and verification required per environment                 |
| Telnyx                              | PSTN/SIP, call control, transfer, signed voice webhooks | Implemented; live resources required                                                 |
| PostgreSQL/Neon-compatible database | Canonical operational state                             | Required for persistence                                                             |
| Vercel                              | Deployment target                                       | Current portfolio deployment target                                                  |
| Calendar adapters                   | Availability and appointment confirmation               | Adapter boundary exists; verify per configured provider                              |
| External CRM/webhook adapters       | Outbound synchronization                                | Adapter opportunities; do not treat as active without configuration and verification |

See [provider boundaries](../architecture/provider-boundaries.md). “Configured” means required settings exist; it does not mean an external provider has been tested.
