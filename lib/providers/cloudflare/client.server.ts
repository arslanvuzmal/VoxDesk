import "server-only";
import { env } from "@/lib/config/env";
import { CloudflareAIError, CloudflareAITokenError } from "./errors";

interface TokenHealthCache {
  valid: boolean;
  checkedAt: number;
}

let cachedHealth: TokenHealthCache | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

export function isCloudflareAIConfigured(): boolean {
  return !!(env.CLOUDFLARE_ACCOUNT_ID && env.CLOUDFLARE_API_TOKEN);
}

export function isCloudflareAIEnabled(): boolean {
  if (!isCloudflareAIConfigured()) return false;
  return env.CLOUDFLARE_AI_KILL_SWITCH !== "true";
}

export async function validateCloudflareTokenServerSide(
  forceFresh = false,
): Promise<{ valid: boolean; reason?: string }> {
  if (!isCloudflareAIEnabled()) {
    return {
      valid: false,
      reason:
        "Cloudflare Workers AI is not configured or kill switch is enabled.",
    };
  }

  const now = Date.now();
  if (
    !forceFresh &&
    cachedHealth &&
    now - cachedHealth.checkedAt < CACHE_TTL_MS
  ) {
    return { valid: cachedHealth.valid };
  }

  const accountId = env.CLOUDFLARE_ACCOUNT_ID!;
  const apiToken = env.CLOUDFLARE_API_TOKEN!;

  try {
    // 1. Verify token status via Cloudflare API
    const verifyRes = await fetch(
      "https://api.cloudflare.com/client/v4/user/tokens/verify",
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!verifyRes.ok) {
      cachedHealth = { valid: false, checkedAt: now };
      return {
        valid: false,
        reason: "Token verification endpoint returned non-200",
      };
    }

    const verifyData = await verifyRes.json();
    if (!verifyData.success || verifyData.result?.status !== "active") {
      cachedHealth = { valid: false, checkedAt: now };
      return {
        valid: false,
        reason: "Cloudflare token is inactive or invalid",
      };
    }

    // 2. Perform minimal Workers AI ping to verify Workers AI Read/Edit access
    const model = env.CLOUDFLARE_LLM_MODEL || "@cf/moonshotai/kimi-k2.6";
    const aiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

    const aiRes = await fetch(aiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 5,
      }),
    });

    if (!aiRes.ok && aiRes.status === 401) {
      cachedHealth = { valid: false, checkedAt: now };
      return {
        valid: false,
        reason: "Token lacks Workers AI Read/Edit permission for account",
      };
    }

    cachedHealth = { valid: true, checkedAt: now };
    return { valid: true };
  } catch (error) {
    cachedHealth = { valid: false, checkedAt: now };
    return {
      valid: false,
      reason:
        error instanceof Error
          ? error.message
          : "Network error validating token",
    };
  }
}

export async function runCloudflareModel<T = any>(
  model: string,
  payload: Record<string, any>,
  timeoutMs = 15000,
): Promise<T> {
  if (!isCloudflareAIEnabled()) {
    throw new CloudflareAIError(
      "Cloudflare Workers AI is currently disabled or unconfigured.",
      "CLOUDFLARE_DISABLED",
      503,
    );
  }

  const accountId = env.CLOUDFLARE_ACCOUNT_ID!;
  const apiToken = env.CLOUDFLARE_API_TOKEN!;

  const gatewayId = env.CLOUDFLARE_AI_GATEWAY_ID || "default";
  let url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

  // If gateway is configured and not default, can use gateway REST URL
  if (gatewayId && gatewayId !== "default") {
    url = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/workers-ai/${model}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new CloudflareAITokenError();
      }
      const errText = await response.text().catch(() => "");
      throw new CloudflareAIError(
        `Cloudflare Workers AI model ${model} failed with status ${response.status}: ${errText.slice(0, 200)}`,
        "CLOUDFLARE_MODEL_FAILED",
        response.status,
      );
    }

    const data = await response.json();
    if (!data.success && data.result === undefined) {
      throw new CloudflareAIError(
        data.errors?.[0]?.message || "Cloudflare Workers AI execution failed.",
        "CLOUDFLARE_EXECUTION_FAILED",
        500,
      );
    }

    return (data.result !== undefined ? data.result : data) as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new CloudflareAIError(
        `Cloudflare Workers AI request timed out after ${timeoutMs}ms`,
        "CLOUDFLARE_TIMEOUT",
        504,
      );
    }
    if (error instanceof CloudflareAIError) throw error;
    throw new CloudflareAIError(
      error.message || "Failed to communicate with Cloudflare Workers AI",
      "CLOUDFLARE_NETWORK_ERROR",
      500,
    );
  }
}
