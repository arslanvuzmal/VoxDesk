import "server-only";
import crypto from "crypto";
import { env } from "@/lib/config/env";
import { demoSessionStore } from "@/lib/demo/store";

export function generateIPHash(ip: string): string {
  const salt = env.IP_HASH_SECRET;
  return crypto
    .createHmac("sha256", salt)
    .update(ip || "127.0.0.1")
    .digest("hex");
}

export function generateUserAgentHash(ua: string): string {
  return crypto
    .createHash("sha256")
    .update(ua || "unknown-ua")
    .digest("hex");
}

export async function validateSessionEligibility(ipHash: string): Promise<{
  eligible: boolean;
  reason?: string;
  code?: string;
}> {
  // Check global kill switch
  if (env.DEMO_LIVE_PROVIDER_KILL_SWITCH === "true") {
    return {
      eligible: false,
      reason:
        "The live provider demonstration is temporarily paused. The guided workflow remains available.",
      code: "KILL_SWITCH_ACTIVE",
    };
  }

  // Check cooldown
  const cooldown = await demoSessionStore.checkCooldown(ipHash);
  if (!cooldown.allowed) {
    return {
      eligible: false,
      reason: `Please wait ${cooldown.secondsRemaining} seconds before starting another session.`,
      code: "COOLDOWN_ACTIVE",
    };
  }

  // Check IP daily limit
  const ipCheck = await demoSessionStore.checkDailyIPLimit(ipHash);
  if (!ipCheck.allowed) {
    return {
      eligible: false,
      reason: `Maximum daily session limit reached for your IP (${ipCheck.limit} sessions/day).`,
      code: "IP_DAILY_LIMIT_EXCEEDED",
    };
  }

  // Check Global daily limit
  const globalCheck = await demoSessionStore.checkGlobalDailyLimit();
  if (!globalCheck.allowed) {
    return {
      eligible: false,
      reason:
        "Global daily demonstration capacity reached for today. Please try again tomorrow.",
      code: "GLOBAL_DAILY_LIMIT_EXCEEDED",
    };
  }

  // Check Concurrent session limit
  const activeCount = await demoSessionStore.countActiveSessions();
  const maxConcurrent =
    parseInt(env.DEMO_MAX_CONCURRENT_SESSIONS_GLOBAL, 10) || 5;
  if (activeCount >= maxConcurrent) {
    return {
      eligible: false,
      reason: "High demonstration traffic. Please wait a moment and try again.",
      code: "CONCURRENT_LIMIT_EXCEEDED",
    };
  }

  return { eligible: true };
}
