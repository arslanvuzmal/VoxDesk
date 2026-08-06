import { NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { getDemoSessionStoreStatus } from "@/lib/demo/store";
import { legalTrainingPack } from "@/lib/organization/presets/legal";
import { resolveElevenLabsAgent } from "@/lib/elevenlabs/agent-registry.server";
import { env } from "@/lib/config/env";

export async function GET() {
  const timestamp = new Date().toISOString();

  // 1. Session Store (Redis / Memory Store)
  const storeStatus = getDemoSessionStoreStatus();

  // 2. Database Check
  let dbHealthy = false;
  let dbError: string | undefined;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbHealthy = true;
  } catch (err: any) {
    dbHealthy = false;
    dbError = err?.message || "Database connection test failed";
  }

  // 3. Voice Provider Readiness (ElevenLabs)
  const apiKeyConfigured = Boolean(
    process.env.ELEVENLABS_API_KEY || env.ELEVENLABS_API_KEY,
  );
  const legalAgent = resolveElevenLabsAgent("LEGAL", "en-US");
  const legalAgentConfigured = Boolean(legalAgent && legalAgent.agentId);

  // 4. Knowledge Index Readiness
  const knowledgeReady = Boolean(legalTrainingPack.faq.length > 0);

  const isHealthy = apiKeyConfigured && legalAgentConfigured && knowledgeReady;
  const statusCode = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      ready: isHealthy,
      status: isHealthy ? "HEALTHY" : "DEGRADED",
      timestamp,
      deploymentCommit: process.env.VERCEL_GIT_COMMIT_SHA || "6e7f0a2",
      elevenLabsApiConfigured: apiKeyConfigured,
      legalEnglishAgentConfigured: legalAgentConfigured,
      redisReady: storeStatus.ready,
      databaseReady: dbHealthy,
      activeBusinessProfile: {
        id: legalTrainingPack.business.id,
        name: legalTrainingPack.business.name,
        version: legalTrainingPack.version,
      },
      readiness: {
        sessionStore: {
          ready: storeStatus.ready,
          provider: storeStatus.provider,
        },
        database: {
          healthy: dbHealthy,
          error: dbError,
        },
        voiceProvider: {
          status: isHealthy ? "READY" : "NOT_CONFIGURED",
          provider: "ELEVENLABS_REACT_SDK",
          primaryVoice: legalTrainingPack.voice.displayName,
        },
      },
    },
    { status: statusCode, headers: { "Cache-Control": "no-store, private" } },
  );
}
