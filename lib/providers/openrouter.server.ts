import "server-only";
import { env } from "@/lib/config/env";
import {
  VoiceAgentOutput,
  VoiceAgentOutputSchema,
  SupportedLanguage,
  DemoIntent,
} from "@/lib/conversation/schemas/voice-agent-output";
import { buildVoiceAgentSystemPrompt } from "@/lib/conversation/prompts/voice-agent-system";
import { getOrganizationProfile } from "@/lib/organization/registry";
import { searchProfileKnowledge } from "@/lib/conversation/knowledge/profile-knowledge";

export interface VoiceAgentTurnInput {
  userMessage: string;
  scenario: DemoIntent;
  currentState: string;
  history: Array<{ role: "CALLER" | "AGENT"; text: string }>;
  accumulatedFields?: Record<string, any>;
  presetKey?: string;
  language?: SupportedLanguage;
}

export interface OpenRouterTurnResult {
  success: boolean;
  data: VoiceAgentOutput;
  fallbackUsed: boolean;
  model: string;
  latencyMs: number;
}

export async function generateAgentTurn(
  scenario: DemoIntent,
  userTranscript: string,
  history: Array<{ role: "CALLER" | "AGENT"; text: string }> = [],
  options?: { presetKey?: string; language?: SupportedLanguage },
): Promise<OpenRouterTurnResult> {
  const startTime = Date.now();
  const apiKey = env.OPENROUTER_API_KEY;
  const model = env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

  const presetKey = options?.presetKey || "LEGAL";
  const language = options?.language || "en-US";
  const profile = getOrganizationProfile(presetKey);

  // If no API key configured, use profile-aware deterministic fallback
  if (!apiKey || apiKey.includes("your-") || apiKey.includes("placeholder")) {
    const fallbackData = getDeterministicFallback(
      userTranscript,
      scenario,
      profile,
      language,
    );
    return {
      success: true,
      data: fallbackData,
      fallbackUsed: true,
      model: "deterministic-profile-engine",
      latencyMs: Date.now() - startTime,
    };
  }

  const systemPrompt = buildVoiceAgentSystemPrompt(profile, language);
  const boundedHistory = history.slice(-4);

  const messages = [
    { role: "system", content: systemPrompt },
    {
      role: "system",
      content: `CURRENT SCENARIO: ${scenario}\nORGANIZATION: ${profile.name}`,
    },
    ...boundedHistory.map((h) => ({
      role: h.role === "CALLER" ? "user" : "assistant",
      content: h.text,
    })),
    { role: "user", content: userTranscript },
  ];

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://voxdesk-ai.vercel.app",
        "X-Title": "VoxDesk AI Voice Receptionist",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 220,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter HTTP ${res.status}`);
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content || "";
    const parsed = parseStructuredOutput(content, language);

    if (parsed) {
      return {
        success: true,
        data: parsed,
        fallbackUsed: false,
        model,
        latencyMs: Date.now() - startTime,
      };
    }
  } catch (error) {
    console.warn(
      "[OPENROUTER LLM FALLBACK]:",
      error instanceof Error ? error.message : error,
    );
  }

  const fallbackData = getDeterministicFallback(
    userTranscript,
    scenario,
    profile,
    language,
  );
  return {
    success: true,
    data: fallbackData,
    fallbackUsed: true,
    model: "deterministic-profile-engine",
    latencyMs: Date.now() - startTime,
  };
}

function parseStructuredOutput(
  raw: string,
  language: SupportedLanguage,
): VoiceAgentOutput | null {
  try {
    let str = raw;
    const jsonMatch = str.match(/\{[\s\S]*\}/);
    if (jsonMatch) str = jsonMatch[0];

    const jsonObj = JSON.parse(str);
    const validated = VoiceAgentOutputSchema.safeParse(jsonObj);
    if (validated.success) {
      return validated.data;
    }
  } catch {}

  return null;
}

export function getDeterministicFallback(
  userQuery: string,
  scenario: DemoIntent,
  profile: any,
  language: SupportedLanguage,
): VoiceAgentOutput {
  const knowledgeMatch = searchProfileKnowledge(userQuery, profile, language);

  if (knowledgeMatch.matched) {
    return {
      spokenReply: knowledgeMatch.answer,
      detectedLanguage: language,
      intent: "ROUTINE",
      secondaryIntent: null,
      suggestedState: "ANSWERING_ROUTINE",
      sentiment: "neutral",
      urgency: knowledgeMatch.isEmergencyEscalation ? "critical" : "low",
      confidence: knowledgeMatch.confidence,
      extractedFields: {},
      missingRequiredFields: [],
      suggestedAction: knowledgeMatch.isEmergencyEscalation
        ? "PREPARE_HANDOFF"
        : "ANSWER_APPROVED_QUESTION",
      requiresHumanReview: knowledgeMatch.isEmergencyEscalation || false,
      handoffReason: knowledgeMatch.escalationReason || null,
      knowledgeReferences: knowledgeMatch.citation
        ? [knowledgeMatch.citation]
        : [],
      nextBestQuestion: null,
      shouldEnd: false,
    };
  }

  const query = userQuery.toLowerCase();
  let responseText = "";
  let action: any = "NONE";
  let state = "PROVIDING_INFORMATION";

  if (
    query.includes("process") ||
    query.includes("service") ||
    query.includes("explain") ||
    query.includes("how does") ||
    query.includes("what do you do")
  ) {
    const serviceList = profile.services
      ? profile.services.map((s: any) => s.name).join(", ")
      : "consultations and specialists";
    responseText = `At ${profile.name}, we provide comprehensive ${profile.industry} solutions including ${serviceList}. Our process begins with a quick intake evaluation, followed by direct assignment to a dedicated senior specialist. May I confirm your name to schedule an initial consultation?`;
    action = "CHECK_AVAILABILITY";
    state = "COLLECTING_INTAKE";
  } else if (
    query.includes("price") ||
    query.includes("cost") ||
    query.includes("fee") ||
    query.includes("retainer") ||
    query.includes("charge") ||
    query.includes("hidden")
  ) {
    responseText = `Our pricing model at ${profile.name} is transparent and flat-rate with zero hidden diagnostic fees or surprise charges. We tailor our packages based on your exact requirements after an initial evaluation. Would you like me to reserve a spot for your detailed consultation?`;
    action = "CHECK_AVAILABILITY";
    state = "PROVIDING_INFORMATION";
  } else if (
    query.includes("book") ||
    query.includes("schedule") ||
    query.includes("appointment") ||
    query.includes("tomorrow") ||
    query.includes("slot") ||
    query.includes("meet") ||
    query.includes("time")
  ) {
    const sampleSlot =
      profile.appointmentSettings?.sampleSlots?.[0] ||
      "tomorrow at 2:00 PM PST";
    responseText = `I would be delighted to reserve an appointment for you! Our next open slot is ${sampleSlot}. May I confirm your full name and mobile phone number to lock in this appointment?`;
    action = "RESERVE_APPOINTMENT";
    state = "COLLECTING_INTAKE";
  } else if (
    query.includes("urgent") ||
    query.includes("emergency") ||
    query.includes("immediately") ||
    query.includes("help") ||
    query.includes("escalat")
  ) {
    const dest = profile.escalationDestination;
    responseText = `I understand this is an urgent matter! I am preparing an immediate priority handoff brief for our ${dest?.department || "On-Call Specialist team"}. Please confirm your phone number so our senior director can call you back right away!`;
    action = "PREPARE_HANDOFF";
    state = "ESCALATING";
  } else {
    responseText = `Thank you for reaching out to ${profile.name}! As Maya, your senior intake specialist, I am here to help you with ${profile.tagline}. We can discuss our services, check appointment availability, or answer any pricing questions you have. How would you like to proceed?`;
    action = "NONE";
    state = "IDENTIFYING_INTENT";
  }

  return {
    spokenReply: responseText,
    detectedLanguage: language,
    intent: scenario,
    secondaryIntent: null,
    suggestedState: state as any,
    sentiment: "neutral",
    urgency: "medium",
    confidence: 0.9,
    extractedFields: {},
    missingRequiredFields: [],
    suggestedAction: action,
    requiresHumanReview: false,
    handoffReason: null,
    knowledgeReferences: [profile.name],
    nextBestQuestion: null,
    shouldEnd: false,
  };
}
