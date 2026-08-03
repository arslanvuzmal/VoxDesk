import "server-only";
import { env } from "@/lib/config/env";
import { runCloudflareModel } from "./client.server";
import {
  CloudflareStructuredOutput,
  CloudflareStructuredOutputSchema,
} from "./schemas";
import { buildVoiceAgentSystemPrompt } from "@/lib/conversation/prompts/voice-agent-system";
import { FEW_SHOT_EXAMPLES } from "@/lib/conversation/prompts/few-shot-examples";

export interface CloudflareLLMRequest {
  userMessage: string;
  scenario: "BOOKING" | "QUALIFICATION" | "ESCALATION" | "ROUTINE";
  currentState: string;
  history: Array<{ role: "CALLER" | "AGENT"; text: string }>;
  extractedFields?: Record<string, any>;
  presetKey?: string;
  language?: string;
}

export async function generateCloudflareResponse(
  input: CloudflareLLMRequest,
): Promise<CloudflareStructuredOutput> {
  const model = env.CLOUDFLARE_LLM_MODEL || "@cf/moonshotai/kimi-k2.6";
  const timeoutMs = parseInt(env.CLOUDFLARE_LLM_TIMEOUT_MS, 10) || 15000;
  const maxTokens = parseInt(env.CLOUDFLARE_MAX_OUTPUT_TOKENS, 10) || 180;
  const temperature = parseFloat(env.CLOUDFLARE_TEMPERATURE) || 0.35;

  // Bound history to last 4 turns max
  const boundedHistory = input.history.slice(-4);
  const systemPrompt = buildVoiceAgentSystemPrompt(
    undefined,
    (input.language as any) || "en-US",
  );

  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: systemPrompt },
    {
      role: "system",
      content: `CURRENT SCENARIO: ${input.scenario}\nCURRENT CONVERSATION STATE: ${input.currentState}\nCURRENT EXTRACTED FIELDS: ${JSON.stringify(input.extractedFields || {})}`,
    },
  ];

  // Add a sample few-shot context
  const sampleExample = FEW_SHOT_EXAMPLES.find(
    (e) => e.category === input.scenario,
  );
  if (sampleExample) {
    messages.push({
      role: "system",
      content: `EXAMPLE INTERACTION:\nCaller: "${sampleExample.caller}"\nMaya Spoken Reply: "${sampleExample.agentReply}"`,
    });
  }

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

    const parsed = parseStructuredOutput(rawText);
    if (parsed) return parsed;

    // Perform 1 repair attempt if JSON parsing failed
    const repairPayload = {
      messages: [
        ...messages,
        {
          role: "assistant",
          content:
            typeof rawText === "string" ? rawText : JSON.stringify(rawText),
        },
        {
          role: "user",
          content:
            "Please format your previous response strictly as valid JSON matching the required schema.",
        },
      ],
      max_tokens: maxTokens,
      temperature: 0.1,
    };

    const repairResult = await runCloudflareModel<any>(
      model,
      repairPayload,
      timeoutMs,
    );
    const repairText =
      repairResult?.response ||
      repairResult?.choices?.[0]?.message?.content ||
      repairResult;

    const repairedParsed = parseStructuredOutput(repairText);
    if (repairedParsed) return repairedParsed;
  } catch (error) {
    console.warn(
      "[CLOUDFLARE LLM FALLBACK]:",
      error instanceof Error ? error.message : error,
    );
  }

  // Fallback to deterministic structured output if model fails
  return getFallbackStructuredOutput(input);
}

function parseStructuredOutput(raw: any): CloudflareStructuredOutput | null {
  if (!raw) return null;

  try {
    let str = typeof raw === "string" ? raw : JSON.stringify(raw);
    const jsonMatch = str.match(/\{[\s\S]*\}/);
    if (jsonMatch) str = jsonMatch[0];

    const jsonObj = JSON.parse(str);
    const validated = CloudflareStructuredOutputSchema.safeParse(jsonObj);
    if (validated.success) {
      return validated.data;
    }
  } catch {
    // Fail silently to trigger fallback
  }

  return null;
}

function getFallbackStructuredOutput(
  input: CloudflareLLMRequest,
): CloudflareStructuredOutput {
  const fallbackReplies: Record<string, string> = {
    BOOKING:
      "I can assist with scheduling your consultation. What date and time works best for your schedule?",
    QUALIFICATION:
      "Thanks for sharing your requirements. What is your estimated timeline for completing this work?",
    ESCALATION:
      "I understand your matter is time-sensitive. I will log a priority escalation brief for our partners.",
    ROUTINE:
      "Our office is open Monday through Friday from 8:30 AM to 6:00 PM EST. Would you like to schedule a call?",
  };

  const spokenReply =
    fallbackReplies[input.scenario] ||
    "Thank you for contacting our office. How may I guide your enquiry today?";

  return {
    spokenReply,
    intent: input.scenario,
    suggestedState: input.currentState,
    extractedFields: {},
    suggestedAction: "NONE",
    confidence: 0.7,
    requiresHumanReview: false,
  };
}
