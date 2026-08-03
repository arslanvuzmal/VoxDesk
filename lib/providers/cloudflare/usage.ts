import "server-only";
import { env } from "@/lib/config/env";

export interface CloudflareUsageTracker {
  sessionSttSeconds: number;
  sessionTtsCharacters: number;
  sessionLlmTokens: number;
}

export function checkCloudflareSessionSttLimit(
  currentSeconds: number,
  additionalSeconds: number,
): boolean {
  const maxSttSeconds =
    parseInt(env.CLOUDFLARE_MAX_STT_SECONDS_PER_SESSION, 10) || 180;
  return currentSeconds + additionalSeconds <= maxSttSeconds;
}

export function checkCloudflareSessionTtsLimit(
  currentCharacters: number,
  additionalCharacters: number,
): boolean {
  const maxTtsCharacters =
    parseInt(env.CLOUDFLARE_MAX_TTS_CHARACTERS_PER_SESSION, 10) || 1800;
  return currentCharacters + additionalCharacters <= maxTtsCharacters;
}
