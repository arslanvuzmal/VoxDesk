# Call State Machine

The telephony call state machine is server-authoritative and independent of the conversation state machine used for demo/web interactions.

States and transitions are defined in `lib/telephony/call-state-machine/index.ts`.

Every transition requires a verified provider event. Invalid state transitions are rejected.
