import { NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export async function GET() {
  const apiKeyConfigured = Boolean(process.env.ELEVENLABS_API_KEY?.trim());
  const agentId = process.env.ELEVENLABS_AGENT_ID_LEGAL_EN?.trim() || process.env.ELEVENLABS_AGENT_ID?.trim();
  const agentConfigured = Boolean(agentId);

  let agentVerified = false;
  if (apiKeyConfigured && agentId) {
    try {
      const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY!.trim() });
      const agent = await client.conversationalAi.agents.get(agentId);
      if (agent && agent.agentId) {
        agentVerified = true;
      }
    } catch {
      agentVerified = false;
    }
  }

  const readyForVoice = apiKeyConfigured && agentConfigured && agentVerified;

  // Persistence status (truthful, but does not block audio provider readiness)
  const databaseConfigured = Boolean(process.env.DATABASE_URL);
  let databaseReachable = false;
  try {
    if (databaseConfigured) {
      await prisma.$queryRaw`SELECT 1`;
      databaseReachable = true;
    }
  } catch {
    databaseReachable = false;
  }

  const redisConfigured = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
  let redisReachable = false;
  if (redisConfigured) {
    try {
      const res = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/ping`, {
        headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
        cache: "no-store",
      });
      redisReachable = res.ok;
    } catch {
      redisReachable = false;
    }
  }

  const deploymentCommit =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    "local-development";

  return NextResponse.json(
    {
      readyForVoice,
      deploymentCommit,
      elevenLabs: {
        apiConfigured: apiKeyConfigured,
        agentConfigured: agentConfigured,
        agentVerified,
      },
      persistence: {
        databaseConfigured,
        databaseReachable,
        redisConfigured,
        redisReachable,
      },
      supportedConfiguration: {
        presetKey: "LEGAL",
        language: "en-US",
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, private",
      },
    }
  );
}
