import "server-only";
import { z } from "zod";

export const StructuredModelResponseSchema = z.object({
  spokenReply: z.string(),
  intent: z.enum([
    "BOOK_APPOINTMENT",
    "GENERAL_ENQUIRY",
    "SALES_ENQUIRY",
    "HUMAN_REQUEST",
    "URGENT_REQUEST",
    "UNKNOWN",
  ]),
  suggestedState: z.string(),
  extractedFields: z.object({
    name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    service: z.string().nullable().optional(),
    budget: z.string().nullable().optional(),
    timeline: z.string().nullable().optional(),
    authority: z.string().nullable().optional(),
    urgency: z.string().nullable().optional(),
  }),
  suggestedAction: z.enum(["NONE", "CHECK_CALENDAR", "QUALIFY_LEAD", "ESCALATE", "COMPLETE"]),
  confidence: z.number().default(0.95),
  requiresHumanReview: z.boolean().default(false),
});

export type StructuredModelResponse = z.infer<typeof StructuredModelResponseSchema>;

export async function generateControlledLLMResponse(
  userTranscript: string,
  scenario: string,
  currentState: string,
  collectedFields: Record<string, string | null>
): Promise<StructuredModelResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const modelName = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
  const maxTokens = parseInt(process.env.OPENROUTER_MAX_OUTPUT_TOKENS || "160", 10);
  const temperature = parseFloat(process.env.OPENROUTER_TEMPERATURE || "0.2");
  const timeoutMs = parseInt(process.env.OPENROUTER_TIMEOUT_MS || "12000", 10);

  // System instructions for Maya receptionist
  const systemPrompt = `You are Maya, an AI voice receptionist for Northstar Legal Consultations.
Current Business Scenario: ${scenario}.
Current State: ${currentState}.
Previously Collected Fields: ${JSON.stringify(collectedFields)}.

Rules:
1. Keep spokenReply concise, professional, plain spoken English (under 300 chars).
2. Ask 1 question at a time.
3. Never give legal advice or invent unapproved prices.
4. Extract fields (name, email, service, budget, timeline, authority, urgency) if mentioned by caller.
5. Return JSON matching: { spokenReply, intent, suggestedState, extractedFields, suggestedAction, confidence, requiresHumanReview }.`;

  if (!apiKey) {
    // Deterministic fallback response when OPENROUTER_API_KEY is not configured
    return getSafeFallbackResponse(userTranscript, currentState, scenario);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://voxdesk-ai.vercel.app",
        "X-OpenRouter-Title": "VoxDesk AI Demo",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: modelName,
        max_tokens: maxTokens,
        temperature: temperature,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userTranscript },
        ],
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`OpenRouter API returned HTTP ${response.status}. Using deterministic fallback.`);
      return getSafeFallbackResponse(userTranscript, currentState, scenario);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return getSafeFallbackResponse(userTranscript, currentState, scenario);
    }

    const parsedJson = JSON.parse(content);
    const validated = StructuredModelResponseSchema.safeParse(parsedJson);

    if (validated.success) {
      return validated.data;
    } else {
      console.warn("Zod validation failed on LLM output, applying safe fallback.");
      return getSafeFallbackResponse(userTranscript, currentState, scenario);
    }
  } catch (error) {
    console.warn("OpenRouter API request failed or timed out. Falling back cleanly:", error);
    return getSafeFallbackResponse(userTranscript, currentState, scenario);
  }
}

function getSafeFallbackResponse(
  transcript: string,
  currentState: string,
  scenario: string
): StructuredModelResponse {
  const lower = transcript.toLowerCase();

  if (scenario === "BOOKING" || lower.includes("book") || lower.includes("appointment") || lower.includes("consultation")) {
    return {
      spokenReply: "I would be happy to schedule your consultation with Northstar Legal. Could I please have your full name and email address for the invite?",
      intent: "BOOK_APPOINTMENT",
      suggestedState: "COLLECTING_CONTACT",
      extractedFields: { service: "Legal Consultation" },
      suggestedAction: "CHECK_CALENDAR",
      confidence: 0.95,
      requiresHumanReview: false,
    };
  }

  if (scenario === "QUALIFICATION" || lower.includes("budget") || lower.includes("retainer") || lower.includes("cost")) {
    return {
      spokenReply: "Thank you for reaching out regarding our commercial legal services. May I ask what your estimated project budget and desired timeline are?",
      intent: "SALES_ENQUIRY",
      suggestedState: "QUALIFYING_LEAD",
      extractedFields: { service: "Commercial Retainer" },
      suggestedAction: "QUALIFY_LEAD",
      confidence: 0.92,
      requiresHumanReview: false,
    };
  }

  if (scenario === "ESCALATION" || lower.includes("urgent") || lower.includes("human") || lower.includes("person") || lower.includes("speak to someone")) {
    return {
      spokenReply: "I understand this is an urgent matter. I am creating a priority transfer brief so one of our legal partners can return your call immediately.",
      intent: "URGENT_REQUEST",
      suggestedState: "PREPARING_ESCALATION",
      extractedFields: { urgency: "High" },
      suggestedAction: "ESCALATE",
      confidence: 0.98,
      requiresHumanReview: true,
    };
  }

  return {
    spokenReply: "Thank you for calling Northstar Legal Consultations. We specialize in corporate law, contract dispute resolution, and business advisory.",
    intent: "GENERAL_ENQUIRY",
    suggestedState: "ANSWERING_APPROVED_QUESTION",
    extractedFields: {},
    suggestedAction: "NONE",
    confidence: 0.90,
    requiresHumanReview: false,
  };
}
