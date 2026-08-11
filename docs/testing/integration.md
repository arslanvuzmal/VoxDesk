# Integration Tests

Run `npm run test:integration`. These tests cover service-level behavior including appointment tools, conversation projection, campaign queue start, Telnyx inbox acknowledgement, outbound worker reconciliation, and ElevenLabs post-call acknowledgement.

Some current tests mock persistence/provider boundaries. A future database-backed integration environment should be introduced only when it tests behavior the mocks cannot prove.
