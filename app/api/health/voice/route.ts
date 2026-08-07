import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { TelnyxProvider } from '@/lib/telephony/providers/telnyx';
import { getProviderReadiness } from '@/lib/features/flags';

export async function GET() {
  const apiKey = (process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS)?.trim();
  const apiKeyConfigured = Boolean(apiKey);
  const agentId =
    process.env.ELEVENLABS_AGENT_ID_LEGAL_EN?.trim() || process.env.ELEVENLABS_AGENT_ID?.trim();
  const agentConfigured = Boolean(agentId);

  let agentVerified = false;
  if (apiKeyConfigured && agentId && apiKey) {
    try {
      const client = new ElevenLabsClient({ apiKey });
      const agent = await client.conversationalAi.agents.get(agentId);
      if (agent && agent.agentId) {
        agentVerified = true;
      }
    } catch {
      agentVerified = false;
    }
  }

  const telnyx = new TelnyxProvider();
  const telnyxHealth = await telnyx.healthCheck();

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
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
        cache: 'no-store',
      });
      redisReachable = res.ok;
    } catch {
      redisReachable = false;
    }
  }

  const readiness = await getProviderReadiness('default');

  const deploymentCommit =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    'local-development';

  const readyForVoice = apiKeyConfigured && agentConfigured && agentVerified;
  const readyForTelephony =
    readiness.inboundTelephony.configured && readiness.inboundTelephony.verified;

  return NextResponse.json(
    {
      readyForVoice,
      readyForTelephony,
      deploymentCommit,
      elevenLabs: {
        apiConfigured: apiKeyConfigured,
        agentConfigured,
        agentVerified,
      },
      telnyx: {
        status: telnyxHealth.status,
        latencyMs: telnyxHealth.latencyMs,
        message: telnyxHealth.message,
      },
      persistence: {
        databaseConfigured,
        databaseReachable,
        redisConfigured,
        redisReachable,
      },
      providerReadiness: {
        webVoice: readiness.webVoice,
        inboundTelephony: readiness.inboundTelephony,
        outboundTelephony: readiness.outboundTelephony,
        persistence: readiness.persistence,
      },
      supportedConfiguration: {
        presetKey: 'LEGAL',
        language: 'en-US',
      },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, private',
      },
    }
  );
}
