import "server-only";
import { env } from "@/lib/config/env";
import { runCloudflareModel } from "./client.server";
import {
  VoiceAgentOutput,
  VoiceAgentOutputSchema,
  SupportedLanguage,
  DemoIntent,
} from "@/lib/conversation/schemas/voice-agent-output";
import { buildVoiceAgentSystemPrompt } from "@/lib/conversation/prompts/voice-agent-system";
import { getOrganizationProfile } from "@/lib/organization/registry";
import { getDeterministicFallback } from "@/lib/providers/openrouter.server";

export interface CloudflareLLMRequest {
  userMessage: string;
  scenario: DemoIntent;
  currentState: string;
  history: Array<{ role: "CALLER" | "AGENT"; text: string }>;
  extractedFields?: Record<string, any>;
  presetKey?: string;
  language?: SupportedLanguage;
}

export async function generateCloudflareResponse(
  input: CloudflareLLMRequest,
): Promise<VoiceAgentOutput> {
  const model = env.CLOUDFLARE_LLM_MODEL || "@cf/moonshotai/kimi-k2.6";
  const timeoutMs = parseInt(env.CLOUDFLARE_LLM_TIMEOUT_MS, 10) || 15000;
  const maxTokens = parseInt(env.CLOUDFLARE_MAX_OUTPUT_TOKENS, 10) || 180;
  const temperature = parseFloat(env.CLOUDFLARE_TEMPERATURE) || 0.35;

  const presetKey = input.presetKey || "LEGAL";
  const language = input.language || "en-US";
  const profile = getOrganizationProfile(presetKey);

  const boundedHistory = input.history.slice(-4);
  const systemPrompt = buildVoiceAgentSystemPrompt(profile, language);

  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: systemPrompt },
    {
      role: "system",
      content: `CURRENT SCENARIO: ${input.scenario}\nCURRENT CONVERSATION STATE: ${input.currentState}\nCURRENT EXTRACTED FIELDS: ${JSON.stringify(input.extractedFields || {})}`,
    },
  ];

  for (const h of boundedHistory) {
    messages.push({
      role: h.role === "CALLER" ? "user" : "assistant",
      content: h.text,
    });
  }

  messages.push({
    role: "user",
    content: input.userMessage,
  });

  const payload = {
    messages,
    max_tokens: maxTokens,
    temperature,
  };

  try {
    const rawResult = await runCloudflareModel<any>(model, payload, timeoutMs);
    const rawText =
      rawResult?.response ||
      rawResult?.choices?.[0]?.message?.content ||
      rawResult;

    const parsed = parseStructuredOutput(rawText, language);
    if (parsed) return parsed;
  } catch (error) {
    console.warn(
      "[CLOUDFLARE LLM FALLBACK]:",
      error instanceof Error ? error.message : error,
    );
  }

  return getFallbackStructuredOutput(input, profile, language);
}

function parseStructuredOutput(
  raw: any,
  language: SupportedLanguage,
): VoiceAgentOutput | null {
  if (!raw) return null;
  try {
    let str = typeof raw === "string" ? raw : JSON.stringify(raw);
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

function getFallbackStructuredOutput(
  input: CloudflareLLMRequest,
  profile: any,
  language: SupportedLanguage,
): VoiceAgentOutput {
  return getDeterministicFallback(
    input.userMessage,
    input.scenario,
    profile,
    language,
  );
}
