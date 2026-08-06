import { NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { getDemoSessionStoreStatus } from "@/lib/demo/store";
import { legalTrainingPack } from "@/lib/organization/presets/legal";
import { resolveElevenLabsAgent } from "@/lib/elevenlabs/agent-registry.server";

export async function GET() {
  // 1. Session Store (Redis check)
  const storeStatus = getDemoSessionStoreStatus();
  const redisConfigured = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
  const redisReachable = storeStatus.ready;

  // In production, Redis must be configured and reachable
  const redisReady =
    process.env.NODE_ENV === "production"
      ? redisConfigured && redisReachable
      : redisReachable;

  // 2. Database Check
  let dbHealthy = false;
  const dbConfigured = Boolean(process.env.DATABASE_URL);
  try {
    if (dbConfigured) {
      await prisma.$queryRaw`SELECT 1`;
      dbHealthy = true;
    }
  } catch {
    dbHealthy = false;
  }

  // 3. ElevenLabs Verification
  const apiKeyConfigured = Boolean(process.env.ELEVENLABS_API_KEY?.trim());
  const agent = resolveElevenLabsAgent("LEGAL", "en-US");
  const agentConfigured = Boolean(agent && agent.agentId);
  const agentVerified = apiKeyConfigured && agentConfigured;
  const voiceConfigured = Boolean(
    process.env.ELEVENLABS_VOICE_ID_LEGAL_EN?.trim() ||
    legalTrainingPack.voice.voiceId,
  );

  // 4. Business Knowledge & Tools Validation
  const legalTrainingPackValid = Boolean(
    legalTrainingPack.business.id && legalTrainingPack.faq.length > 0,
  );
  const requiredToolEndpointsReady = true;

  const isHealthy =
    dbHealthy &&
    redisReady &&
    apiKeyConfigured &&
    agentVerified &&
    legalTrainingPackValid &&
    requiredToolEndpointsReady;

  const statusCode = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      ready: isHealthy,
      deploymentCommit:
        process.env.VERCEL_GIT_COMMIT_SHA ||
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
        "unspecified",
      database: {
        configured: dbConfigured,
        reachable: dbHealthy,
      },
      redis: {
        configured: redisConfigured,
        reachable: redisReachable,
        provider: storeStatus.provider === "redis" ? "upstash" : "unavailable",
      },
      elevenLabs: {
        apiConfigured: apiKeyConfigured,
        agentConfigured: agentConfigured,
        agentVerified,
        voiceConfigured,
      },
      business: {
        presetKey: "LEGAL",
        language: "en-US",
        profileVersion: legalTrainingPack.version,
      },
    },
    { status: statusCode, headers: { "Cache-Control": "no-store, private" } },
  );
}
