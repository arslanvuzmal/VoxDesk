import "server-only";

export interface RoutineQA {
  keywords: string[];
  answer: string;
  suggestedAction: "NONE" | "CHECK_DEMO_CALENDAR" | "PREPARE_HANDOFF";
}

export const NORTHSTAR_LEGAL_KNOWLEDGE: RoutineQA[] = [
  {
    keywords: [
      "hours",
      "open",
      "timing",
      "schedule",
      "when do you open",
      "closing time",
    ],
    answer:
      "The fictional demo office for Northstar Legal Consultations is open Monday through Friday from 9:00 AM to 5:00 PM EST. Would you like to schedule a consultation slot?",
    suggestedAction: "CHECK_DEMO_CALENDAR",
  },
  {
    keywords: [
      "location",
      "address",
      "where are you",
      "office located",
      "where is your office",
    ],
    answer:
      "Northstar Legal Consultations is located at 100 Legal Plaza, Suite 400, New York, NY 10001. We also conduct remote video consultations.",
    suggestedAction: "NONE",
  },
  {
    keywords: [
      "cancel",
      "cancellation",
      "reschedule policy",
      "cancel appointment",
    ],
    answer:
      "Appointments can be cancelled or rescheduled up to 2 hours before your start time with no penalty in our demo workflow.",
    suggestedAction: "NONE",
  },
  {
    keywords: [
      "human",
      "speak to a person",
      "real person",
      "operator",
      "talk to human",
    ],
    answer:
      "I understand you'd like to speak with a human team member. I can prepare an immediate callback task for our partner team right now.",
    suggestedAction: "PREPARE_HANDOFF",
  },
  {
    keywords: [
      "services",
      "what do you do",
      "practice areas",
      "what kind of law",
    ],
    answer:
      "Northstar Legal Consultations provides advice on commercial contracts, corporate retainer agreements, dispute resolution, and employment matters.",
    suggestedAction: "NONE",
  },
];

export function getDeterministicRoutineAnswer(
  userInput: string,
): { spokenReply: string; suggestedAction: string } | null {
  const normalized = userInput.toLowerCase().trim();

  for (const item of NORTHSTAR_LEGAL_KNOWLEDGE) {
    if (item.keywords.some((kw) => normalized.includes(kw))) {
      return {
        spokenReply: item.answer,
        suggestedAction: item.suggestedAction,
      };
    }
  }

  return null;
}
