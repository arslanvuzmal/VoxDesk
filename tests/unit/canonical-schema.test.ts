import { describe, it, expect } from "vitest";
import { VoiceAgentOutputSchema } from "@/lib/conversation/schemas/voice-agent-output";
import { validateStateTransition } from "@/lib/conversation/state-machine";

describe("Canonical Output Schema & State Machine", () => {
  it("should validate a correct voice agent structured output", () => {
    const validData = {
      spokenReply: "Hello, thank you for calling. How can I assist you?",
      detectedLanguage: "en-US",
      intent: "BOOKING",
      secondaryIntent: null,
      suggestedState: "COLLECTING_REQUIREMENTS",
      sentiment: "positive",
      urgency: "medium",
      confidence: 0.95,
      extractedFields: { name: "John Doe" },
      missingRequiredFields: ["phone"],
      suggestedAction: "NONE",
      requiresHumanReview: false,
      handoffReason: null,
      knowledgeReferences: [],
      nextBestQuestion: "What is your preferred callback number?",
      shouldEnd: false,
    };

    const parsed = VoiceAgentOutputSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it("should validate safe state transitions", () => {
    const nextState = validateStateTransition("GREETING", "IDENTIFYING_INTENT");
    expect(nextState).toBe("IDENTIFYING_INTENT");
  });

  it("should reject invalid state jumps", () => {
    const nextState = validateStateTransition("GREETING", "BOOKING");
    expect(nextState).toBe("GREETING");
  });
});
