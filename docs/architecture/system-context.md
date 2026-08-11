# System Context

```mermaid
flowchart TB
  Customer[Customer]
  Channels[Phone / Web Voice / Web Chat]
  VoxDesk[VoxDesk application]
  ElevenLabs[ElevenLabs\nconversational intelligence]
  Telnyx[Telnyx\nPSTN and SIP]
  Data[PostgreSQL / CRM state]
  Queue[Redis-compatible leases and quotas]
  Human[Human team]

  Customer --> Channels --> VoxDesk
  VoxDesk <--> ElevenLabs
  VoxDesk <--> Telnyx
  VoxDesk --> Data
  VoxDesk --> Queue
  VoxDesk --> Human
```

ElevenLabs owns realtime agent interaction. Telnyx owns phone transport. VoxDesk owns tenancy, business state, policy, authorization, persistence, compliance controls, and reconciliation.
