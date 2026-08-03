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

  const greeting = profile.greetings[language] || profile.greetings["en-US"];
  return {
    spokenReply: greeting,
    detectedLanguage: language,
    intent: scenario,
    secondaryIntent: null,
    suggestedState: "IDENTIFYING_INTENT",
    sentiment: "neutral",
    urgency: "medium",
    confidence: 0.85,
    extractedFields: {},
    missingRequiredFields: [],
    suggestedAction: "NONE",
    requiresHumanReview: false,
    handoffReason: null,
    knowledgeReferences: [],
    nextBestQuestion: null,
    shouldEnd: false,
  };
}
