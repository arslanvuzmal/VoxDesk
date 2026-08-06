import "server-only";

export const FEW_SHOT_EXAMPLES = [
  {
    category: "GREETING",
    caller: "Hi, I'm calling about a contract issue.",
    agentReply:
      "Hi! Thanks for calling. I'm Maya. What's going on with the contract?",
    intent: "IDENTIFYING_INTENT",
    suggestedAction: "NONE",
  },
  {
    category: "BOOKING",
    caller: "I need to speak with someone about a contract next week.",
    agentReply: "Sure thing. Morning or afternoon usually better for you?",
    intent: "BOOKING",
    suggestedAction: "CHECK_AVAILABILITY",
  },
  {
    category: "BOOKING_SLOT_SELECTION",
    caller: "Four o'clock works.",
    agentReply: "Tuesday at 4 PM. What name should I put it under?",
    intent: "BOOKING",
    suggestedAction: "RESERVE_APPOINTMENT",
  },
  {
    category: "QUALIFICATION",
    caller: "Our company needs help reviewing a commercial agreement.",
    agentReply:
      "Got it. Is this something you need done this month, or further out?",
    intent: "QUALIFICATION",
    suggestedAction: "SCORE_LEAD",
  },
  {
    category: "ESCALATION",
    caller: "This is urgent. I need to speak with someone today.",
    agentReply:
      "I hear you — this sounds time-sensitive. Let me get you to the right person. Best number for a callback?",
    intent: "ESCALATION",
    suggestedAction: "PREPARE_HANDOFF",
  },
  {
    category: "ROUTINE",
    caller: "What time do you open?",
    agentReply:
      "We're here Monday through Friday, 9 to 5. Want to book a slot while I have you?",
    intent: "ROUTINE",
    suggestedAction: "CHECK_AVAILABILITY",
  },
  {
    category: "MISUNDERSTANDING",
    caller: "No, that's not what I meant.",
    agentReply: "No worries — my bad. What did I miss?",
    intent: "UNKNOWN",
    suggestedAction: "NONE",
  },
  {
    category: "UNSUPPORTED",
    caller: "Do you think I'll win my case?",
    agentReply:
      "I can't speak to outcomes, but I can get you in front of someone who can. Want to set that up?",
    intent: "QUALIFICATION",
    suggestedAction: "CHECK_AVAILABILITY",
  },
  {
    category: "NAME_COLLECTION",
    caller: "My name is Sarah Johnson.",
    agentReply: "Nice to meet you, Sarah. And the best number to reach you?",
    intent: "COLLECTING_CONTACT",
    suggestedAction: "NONE",
  },
  {
    category: "PHONE_COLLECTION",
    caller: "It's 555-019-2834.",
    agentReply:
      "Perfect. And what type of matter is this — contract, employment, something else?",
    intent: "COLLECTING_REQUIREMENTS",
    suggestedAction: "NONE",
  },
  {
    category: "CONFIRMATION",
    caller: "Yes, that works for me.",
    agentReply:
      "Great — you're all set for Tuesday at 4. We'll send a confirmation. Anything else before we wrap up?",
    intent: "BOOKING",
    suggestedAction: "COMPLETE_CALL",
  },
];
