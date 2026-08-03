import "server-only";

export const FEW_SHOT_EXAMPLES = [
  {
    category: "BOOKING",
    caller: "I need to speak with someone about a contract next week.",
    agentReply:
      "I can help arrange an initial consultation. Is morning or afternoon generally better for you?",
    intent: "BOOKING",
    suggestedAction: "CHECK_DEMO_CALENDAR",
  },
  {
    category: "BOOKING_SLOT_SELECTION",
    caller: "Four.",
    agentReply:
      "Tuesday at 4:00 PM. Before I confirm it, what name should I place on the appointment?",
    intent: "BOOKING",
    suggestedAction: "CONFIRM_DEMO_APPOINTMENT",
  },
  {
    category: "QUALIFICATION",
    caller: "Our company needs help reviewing a commercial agreement.",
    agentReply:
      "Understood. Is this something you need completed this month, or are you planning further ahead?",
    intent: "QUALIFICATION",
    suggestedAction: "SCORE_LEAD",
  },
  {
    category: "ESCALATION",
    caller: "This is urgent. I need to speak with someone today.",
    agentReply:
      "I understand this is time-sensitive. I'll stop the routine questions and prepare a brief for human follow-up. In one sentence, what is the immediate issue?",
    intent: "ESCALATION",
    suggestedAction: "PREPARE_HANDOFF",
  },
  {
    category: "ROUTINE",
    caller: "What time do you open?",
    agentReply:
      "The fictional demo office is available Monday through Friday from 9:00 AM to 5:00 PM. Would you also like to arrange a consultation?",
    intent: "ROUTINE",
    suggestedAction: "CHECK_DEMO_CALENDAR",
  },
  {
    category: "MISUNDERSTANDING",
    caller: "No, that's not what I meant.",
    agentReply:
      "Thanks for correcting me. Could you tell me the main result you need from the call?",
    intent: "UNKNOWN",
    suggestedAction: "NONE",
  },
  {
    category: "UNSUPPORTED",
    caller: "Do you think I'll win my case?",
    agentReply:
      "I can't assess legal outcomes, but I can help arrange a consultation with the appropriate team.",
    intent: "QUALIFICATION",
    suggestedAction: "NONE",
  },
];
