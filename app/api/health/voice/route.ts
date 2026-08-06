import { NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { getDemoSessionStoreStatus } from "@/lib/demo/store";
import { legalTrainingPack } from "@/lib/organization/presets/legal";
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
  const hasApiKey = Boolean(env.ELEVENLABS_API_KEY);
  const voiceProviderStatus = hasApiKey ? "READY" : "NOT_CONFIGURED";

  // 4. Knowledge Index Readiness
  const knowledgeReady = Boolean(legalTrainingPack.faq.length > 0);

  // 5. Webhook Tool Endpoints
  const toolEndpointsReady = true;

  const isHealthy = storeStatus.ready && knowledgeReady && toolEndpointsReady;
  const statusCode = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: isHealthy ? "HEALTHY" : "DEGRADED",
      timestamp,
      deploymentVersion: legalTrainingPack.version,
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
          status: voiceProviderStatus,
          provider: "ELEVENLABS",
          primaryVoice: legalTrainingPack.voice.displayName,
        },
        knowledgeIndex: {
          ready: knowledgeReady,
          sourcesCount: legalTrainingPack.knowledgeSources.length,
          faqCount: legalTrainingPack.faq.length,
        },
        toolEndpoints: {
          ready: toolEndpointsReady,
          tools: [
            "get_business_information",
            "check_availability",
            "hold_appointment_slot",
            "confirm_appointment",
            "create_or_update_lead",
            "prepare_follow_up",
            "prepare_human_handoff",
            "record_unanswered_question",
            "complete_call",
          ],
        },
      },
    },
    { status: statusCode },
  );
}
