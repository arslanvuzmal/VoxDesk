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
        temperature: 0.65,
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
  let sentiment: "positive" | "neutral" | "negative" | "concerned" = "neutral";
  let urgency: "low" | "medium" | "high" | "critical" = "medium";

  // Greeting / opening
  if (
    query.includes("hello") ||
    query.includes("hi ") ||
    query.includes("hey") ||
    query.includes("good morning") ||
    query.includes("good afternoon")
  ) {
    responseText = `Hi there! Thanks for calling ${profile.name}. I'm ${profile.voiceIdentity.name}. How can I help you today?`;
    action = "NONE";
    state = "GREETING";
    sentiment = "positive";
    urgency = "low";
  }
  // Process / services inquiry
  else if (
    query.includes("process") ||
    query.includes("service") ||
    query.includes("explain") ||
    query.includes("how does") ||
    query.includes("what do you do") ||
    query.includes("what services")
  ) {
    const serviceList = profile.services
      ? profile.services.map((s: any) => s.name).join(", ")
      : "consultations and specialists";
    responseText = `We offer ${serviceList}. It starts with a quick intake call, then we match you with the right specialist. What made you reach out today?`;
    action = "CHECK_AVAILABILITY";
    state = "IDENTIFYING_INTENT";
    sentiment = "positive";
  }
  // Pricing
  else if (
    query.includes("price") ||
    query.includes("cost") ||
    query.includes("fee") ||
    query.includes("retainer") ||
    query.includes("charge") ||
    query.includes("hidden") ||
    query.includes("budget")
  ) {
    responseText = `Our pricing is flat-rate and transparent — no hidden fees. The exact amount depends on your situation after an initial eval. Want me to check availability for a consultation?`;
    action = "CHECK_AVAILABILITY";
    state = "PROVIDING_INFORMATION";
    sentiment = "neutral";
  }
  // Booking
  else if (
    query.includes("book") ||
    query.includes("schedule") ||
    query.includes("appointment") ||
    query.includes("tomorrow") ||
    query.includes("slot") ||
    query.includes("meet") ||
    query.includes("time") ||
    query.includes("when") ||
    query.includes("available")
  ) {
    const sampleSlot =
      profile.appointmentSettings?.sampleSlots?.[0] ||
      "tomorrow at 2:00 PM PST";
    responseText = `I'd be happy to get something on the calendar. We've got ${sampleSlot} open — does that work? If so, just give me your name and number and I'll lock it in.`;
    action = "RESERVE_APPOINTMENT";
    state = "COLLECTING_CONTACT";
    sentiment = "positive";
  }
  // Urgency / emergency
  else if (
    query.includes("urgent") ||
    query.includes("emergency") ||
    query.includes("immediately") ||
    query.includes("help") ||
    query.includes("escalat") ||
    query.includes("asap") ||
    query.includes("right now")
  ) {
    const dest = profile.escalationDestination;
    responseText = `This sounds urgent — let me get you to the right person right away. What's the best number for our ${dest?.department || "senior team"} to call you back on?`;
    action = "PREPARE_HANDOFF";
    state = "ESCALATING";
    sentiment = "concerned";
    urgency = "critical";
  }
  // Name provided
  else if (
    query.includes("my name is") ||
    query.includes("i'm ") ||
    query.includes("this is ")
  ) {
    responseText = `Nice to meet you! And what's the best phone number to reach you at?`;
    action = "NONE";
    state = "COLLECTING_CONTACT";
    sentiment = "positive";
  }
  // Phone provided
  else if (/\d{3}[-.]?\d{3}[-.]?\d{4}/.test(query)) {
    responseText = `Got it. And what type of matter are you calling about today?`;
    action = "NONE";
    state = "COLLECTING_REQUIREMENTS";
    sentiment = "neutral";
  }
  // Fallback
  else {
    const fallbacks = [
      `I want to make sure I understand — could you tell me a bit more about what you need?`,
      `Thanks for sharing that. What's the main thing you're hoping to accomplish?`,
      `Got it. So what would be the ideal outcome for you here?`,
    ];
    responseText = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    action = "NONE";
    state = "IDENTIFYING_INTENT";
  }

  return {
    spokenReply: responseText,
    detectedLanguage: language,
    intent: scenario,
    secondaryIntent: null,
    suggestedState: state as any,
    sentiment,
    urgency,
    confidence: 0.85,
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
