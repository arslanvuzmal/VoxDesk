# Tool authorization

Every tool request carries a signed, short-lived ConversationContext containing conversation, workspace, business, optional contact, agent, agent version, training pack, channel, direction, language, issue time, and expiry.

The server verifies the signature and expiry, resolves the conversation and tenant again, validates the tool schema, checks role/workflow/business policy, enforces idempotency, executes a real adapter, persists a safe result, and returns only the minimum agent response.

Browser or model values never establish workspace, business, contact, agent, or authority. Forged or expired context is rejected. Demo side effects live behind an explicit isolated adapter.
