# Authentication and Authorization

Protected application requests resolve a session, user, workspace membership, role, and authorized workspace before accessing a resource. Resource IDs are not authority. Cross-workspace reads and writes should return non-disclosing not-found or forbidden responses.

Tool requests additionally require a signed, short-lived ConversationContext. Provider webhooks authenticate with provider-specific signature verification rather than a browser session.
