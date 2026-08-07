# Webhook Security

## Telnyx ED25519 Verification

Every webhook from `/api/webhooks/telnyx/voice` verifies:

1. `TELNYX_PUBLIC_KEY` is configured
2. The ED25519 signature header (`x-telnyx-ed25519-signature`) is present
3. The timestamp header (`x-telnyx-timestamp`) is within 5 minutes tolerance
4. Event idempotency is checked by provider event ID

Invalid signatures are rejected in production (`NODE_ENV === 'production'`).

## Raw Event Storage

Raw webhook payloads are stored safely before acknowledgment. Sensitive transcript content is not included in general analytics logs.

## Async Processing

Business logic (LLM evaluation, database aggregation, analytics) runs asynchronously after acknowledgment. The webhook response is returned quickly to prevent provider retries.
