import "server-only";
import { z } from "zod";
import { env } from "@/lib/config/env";

export const OPENROUTER_ALLOWED_MODELS = [
  "openai/gpt-4o-mini",
  "openai/gpt-3.5-turbo",
  "anthropic/claude-3-haiku",
  "google/gemini-flash-1.5",
] as const;

export const StructuredModelResponseSchema = z.object({
  spokenReply: z.string().max(350),
  detectedIntent: z.string().max(100),
  conversationState: z.enum([
    "READY",
    "GREETING",
    "IDENTIFYING_INTENT",
    "ANSWERING_APPROVED_QUESTION",
    "COLLECTING_CONTACT",
    "COLLECTING_REQUIREMENTS",
    "CHECKING_AVAILABILITY",
    "OFFERING_SLOTS",
    "AWAITING_BOOKING_CONFIRMATION",
    "QUALIFYING_LEAD",
    "PREPARING_ESCALATION",
    "CLOSING",
    "COMPLETED",
    "FAILED",
  ]),
  extractedFields: z.record(z.any()).default({}),
  shouldEnd: z.boolean().default(false),
  suggestedAction: z
    .enum(["NONE", "CONFIRM_APPOINTMENT", "QUALIFY_LEAD", "ESCALATE_HUMAN"])
    .default("NONE"),
});

export type StructuredModelResponse = z.infer<
  typeof StructuredModelResponseSchema
>;

export async function generateAgentTurn(
  scenario: string,
  userTranscript: string,
  history: Array<{ role: string; text: string }> = [],
): Promise<{
  data: StructuredModelResponse;
  fallbackUsed: boolean;
  usage?: { inputTokens: number; outputTokens: number };
}> {
  // Check global kill switch
  if (
    env.DEMO_LIVE_PROVIDER_KILL_SWITCH === "true" ||
    !env.OPENROUTER_API_KEY
  ) {
    return {
      data: getDeterministicFallback(scenario, userTranscript),
      fallbackUsed: true,
    };
  }

  const model = OPENROUTER_ALLOWED_MODELS.includes(env.OPENROUTER_MODEL as any)
    ? env.OPENROUTER_MODEL
    : "openai/gpt-4o-mini";

  const systemPrompt = `You are Maya, an AI voice receptionist for Northstar Legal Consultations.
Target Scenario: ${scenario}.
Keep spoken reply concise, natural, professional, under 30 words (max 350 chars).
Return structured JSON with keys: spokenReply, detectedIntent, conversationState, extractedFields, shouldEnd, suggestedAction.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      parseInt(env.OPENROUTER_TIMEOUT_MS, 10) || 12000,
    );

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": env.APP_URL,
          "X-Title": "VoxDesk AI Receptionist",
        },
        body: JSON.stringify({
          model: model,
          temperature: parseFloat(env.OPENROUTER_TEMPERATURE) || 0.2,
          max_tokens: parseInt(env.OPENROUTER_MAX_OUTPUT_TOKENS, 10) || 160,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            ...history.slice(-4).map((h) => ({
              role: h.role === "CALLER" ? "user" : "assistant",
              content: h.text,
            })),
            { role: "user", content: userTranscript.slice(0, 600) },
          ],
        }),
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        data: getDeterministicFallback(scenario, userTranscript),
        fallbackUsed: true,
      };
    }

    const resJson = await response.json();
    const rawContent = resJson.choices?.[0]?.message?.content || "";
    const parsedJson = JSON.parse(rawContent);
    const validated = StructuredModelResponseSchema.parse(parsedJson);

    return {
      data: validated,
      fallbackUsed: false,
      usage: {
        inputTokens: resJson.usage?.prompt_tokens || 40,
        outputTokens: resJson.usage?.completion_tokens || 80,
      },
    };
  } catch (error) {
    return {
      data: getDeterministicFallback(scenario, userTranscript),
      fallbackUsed: true,
    };
  }
}

export function getDeterministicFallback(
  scenario: string,
  userTranscript: string,
): StructuredModelResponse {
  const text = userTranscript.toLowerCase();

  if (scenario === "BOOKING") {
    if (
      text.includes("yes") ||
      text.includes("confirm") ||
      text.includes("book") ||
      text.includes("tuesday")
    ) {
      return {
        spokenReply:
          "Excellent! I have reserved Tuesday at 10:00 AM for your consultation. A confirmation email has been dispatched.",
        detectedIntent: "Appointment Confirmed",
        conversationState: "CLOSING",
        extractedFields: {
          slot: "Tuesday 10:00 AM",
          callerName: "Sarah Miller",
        },
        shouldEnd: true,
        suggestedAction: "CONFIRM_APPOINTMENT",
      };
    }
    return {
      spokenReply:
        "I have openings available next Tuesday at 10:00 AM or 2:30 PM. Would either of those times work for your legal consultation?",
      detectedIntent: "Appointment Scheduling",
      conversationState: "OFFERING_SLOTS",
      extractedFields: {
        availableSlots: ["Tuesday 10:00 AM", "Tuesday 2:30 PM"],
      },
      shouldEnd: false,
      suggestedAction: "NONE",
    };
  }

  if (scenario === "QUALIFICATION") {
    return {
      spokenReply:
        "Thank you for providing those details. Based on your timeline and budget, I have scored this as a high-priority commercial inquiry.",
      detectedIntent: "Lead Qualification Intake",
      conversationState: "CLOSING",
      extractedFields: {
        budgetRange: "$10k-$25k",
        timeline: "Immediate",
        category: "HOT",
      },
      shouldEnd: true,
      suggestedAction: "QUALIFY_LEAD",
    };
  }

  if (scenario === "ESCALATION") {
    return {
      spokenReply:
        "I understand this is urgent regarding contract litigation. I am preparing a priority Transfer Brief for Senior Counsel right away.",
      detectedIntent: "Urgent Partner Escalation",
      conversationState: "PREPARING_ESCALATION",
      extractedFields: { urgency: "HIGH", partner: "Arslan Vuzmal Lone" },
      shouldEnd: true,
      suggestedAction: "ESCALATE_HUMAN",
    };
  }

  return {
    spokenReply:
      "Northstar Legal is open Monday through Friday from 9:00 AM to 6:00 PM. Is there anything else I can help answer for you?",
    detectedIntent: "Approved Business Hours Q&A",
    conversationState: "CLOSING",
    extractedFields: { hours: "9:00 AM - 6:00 PM EST" },
    shouldEnd: true,
    suggestedAction: "NONE",
  };
}
