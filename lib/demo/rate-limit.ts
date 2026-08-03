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

  // IP Daily Limit, Cooldown, and Global Capacity Limits completely removed as requested
  return { eligible: true };
}
