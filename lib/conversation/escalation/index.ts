import { LeadCategory } from "../qualification";

export interface EscalationContextInput {
  callId: string;
  callerName?: string;
  callerNumberMasked: string;
  intent?: string;
  summaryText?: string;
  qualificationScore?: number;
  qualificationCategory?: LeadCategory;
  lastUnresolvedQuestion?: string;
  triggerReason: string;
}

export interface HumanTransferBrief {
  callId: string;
  callerName: string;
  callerNumberMasked: string;
  intent: string;
  qualificationSummary: string;
  sentiment: string;
  urgency: "low" | "medium" | "high" | "critical";
  lastUnresolvedQuestion: string;
  recommendedNextAction: string;
  generatedAt: Date;
}

export function detectEscalationTrigger(transcriptText: string): { shouldEscalate: boolean; reason?: string } {
  const text = transcriptText.toLowerCase();

  if (text.includes("human") || text.includes("agent") || text.includes("person") || text.includes("representative") || text.includes("speak to someone")) {
    return { shouldEscalate: true, reason: "Caller explicitly requested a human operator" };
  }
  if (text.includes("emergency") || text.includes("urgent") || text.includes("legal action") || text.includes("lawsuit") || text.includes("malpractice")) {
    return { shouldEscalate: true, reason: "Urgent legal or emergency trigger phrase detected" };
  }
  if (text.includes("complain") || text.includes("manager") || text.includes("supervisor") || text.includes("unhappy") || text.includes("furious")) {
    return { shouldEscalate: true, reason: "Caller dissatisfaction / complaint trigger" };
  }
  return { shouldEscalate: false };
}

export function createTransferBrief(input: EscalationContextInput): HumanTransferBrief {
  const callerName = input.callerName || "Unknown Caller";
  const intent = input.intent || "General Enquiry";
  const score = input.qualificationScore ?? 0;
  const category = input.qualificationCategory || "REVIEW";

  let urgency: "low" | "medium" | "high" | "critical" = "medium";
  if (input.triggerReason.includes("emergency") || input.triggerReason.includes("urgent")) {
    urgency = "critical";
  } else if (category === "HOT") {
    urgency = "high";
  }

  return {
    callId: input.callId,
    callerName,
    callerNumberMasked: input.callerNumberMasked,
    intent,
    qualificationSummary: `Category: ${category} (Score: ${score}/100)`,
    sentiment: urgency === "critical" ? "negative" : "neutral",
    urgency,
    lastUnresolvedQuestion: input.lastUnresolvedQuestion || "General human assistance required",
    recommendedNextAction: `Review transfer context and accept live call handoff for ${callerName}.`,
    generatedAt: new Date(),
  };
}
