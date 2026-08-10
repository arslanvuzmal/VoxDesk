# Conversation orchestration

The orchestrator determines intent, requested outcome, risk, verified language, specialist, and human escalation. It maintains ConversationState and does not treat the transcript as authoritative workflow state.

Useful specialists include reception, scheduling, sales qualification, support, account service, callback, complaint resolution, and escalation. A handoff carries identity state, language, intent, collected fields, summary, appointments, cases, and tool results.

The model requests actions but has no authority. Signed ConversationContext, schema validation, tenant authorization, role and workflow policy, idempotency, and a real adapter precede every side effect. Loops have explicit deadlines, iteration limits, cancellation, terminal states, and human fallback.
