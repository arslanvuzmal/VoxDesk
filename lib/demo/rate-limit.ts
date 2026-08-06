import "server-only";
import crypto from "crypto";
import { env } from "@/lib/config/env";
import { demoSessionStore } from "@/lib/demo/store";

export function generateIPHash(ip: string): string {
  const salt = env.IP_HASH_SECRET || "default_ip_hash_salt_key_32_chars";
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

export async function validateSessionEligibility(
  ipHash: string,
  isAdminOverride: boolean = false,
): Promise<{
  eligible: boolean;
  reason?: string;
  code?: string;
}> {
  // 1. Check Global Kill Switch
  if (env.DEMO_LIVE_PROVIDER_KILL_SWITCH === "true") {
    return {
      eligible: false,
      reason:
        "The live provider demonstration is temporarily paused for scheduled maintenance.",
      code: "KILL_SWITCH_ACTIVE",
    };
  }

  if (isAdminOverride) {
    return { eligible: true };
  }

  // 2. Per-IP Daily Limit Check (Default 10 per IP per day)
  const maxPerIp = parseInt(env.DEMO_SESSIONS_PER_IP_PER_DAY || "10", 10);
  const ipSessionsToday = await demoSessionStore.getIpDailySessionCount(ipHash);
  if (ipSessionsToday >= maxPerIp) {
    return {
      eligible: false,
      reason: `You have reached the daily limit of ${maxPerIp} voice demo calls per IP. Please try again tomorrow.`,
      code: "IP_DAILY_LIMIT_EXCEEDED",
    };
  }

  // 3. Cooldown Check (Default 15 seconds)
  const cooldownSeconds = parseInt(
    env.DEMO_SESSION_COOLDOWN_SECONDS || "15",
    10,
  );
  const inCooldown = await demoSessionStore.checkIpCooldown(
    ipHash,
    cooldownSeconds,
  );
  if (inCooldown) {
    return {
      eligible: false,
      reason: `Please wait ${cooldownSeconds} seconds before initiating another voice call.`,
      code: "COOLDOWN_ACTIVE",
    };
  }

  // 4. Global Concurrency Check (Default 10 active concurrent calls max)
  const maxConcurrent = parseInt(
    env.DEMO_MAX_CONCURRENT_SESSIONS_GLOBAL || "10",
    10,
  );
  const activeCount = await demoSessionStore.getActiveSessionCount();
  if (activeCount >= maxConcurrent) {
    return {
      eligible: false,
      reason:
        "All voice demonstration channels are currently busy. Please try again shortly.",
      code: "GLOBAL_CAPACITY_REACHED",
    };
  }

  return { eligible: true };
}
