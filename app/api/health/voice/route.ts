import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { getProviderReadiness } from '@/lib/features/flags';
import { getTelephonyCapabilityMatrix } from '@/lib/telephony/capability-matrix';
import { getTelephonyProvider } from '@/lib/telephony/providers/factory';

export async function GET() {
  const apiKey = (process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS)?.trim();
  const apiKeyConfigured = Boolean(apiKey);
  const agentId =
    process.env.ELEVENLABS_AGENT_ID?.trim() || process.env.ELEVENLABS_AGENT_ID_LEGAL_EN?.trim();
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

  const telephonyMatrix = getTelephonyCapabilityMatrix();
  let telephonyHealth;
  try {
    telephonyHealth = await getTelephonyProvider().healthCheck();
  } catch {
    telephonyHealth = {
      providerType: 'TELNYX',
      status: 'MISCONFIGURED',
      latencyMs: 0,
      message: 'Live PSTN activation requirements are incomplete.',
    };
  }

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

  const readinessIssues: string[] = [];
  if (!apiKeyConfigured) readinessIssues.push('ELEVENLABS_API_KEY is not configured.');
  if (!agentConfigured) readinessIssues.push('ELEVENLABS_AGENT_ID is not configured.');
  if (apiKeyConfigured && agentConfigured && !agentVerified) {
    readinessIssues.push('The configured ElevenLabs agent could not be verified.');
  }
  if (!databaseConfigured) readinessIssues.push('DATABASE_URL is not configured.');
  if (databaseConfigured && !databaseReachable) {
    readinessIssues.push('The CRM database could not be reached.');
  }

  // A demo conversation is only live when both the voice provider and the
  // canonical CRM persistence path are available. Otherwise the interface
  // must not imply a conversation was captured when it cannot be stored.
  const readyForVoice = readinessIssues.length === 0;
  const readyForTelephony = telephonyMatrix.readiness === 'LIVE_READY';

  return NextResponse.json(
    {
      readyForVoice,
      readyForTelephony,
      readinessIssues,
      deploymentCommit,
      elevenLabs: {
        apiConfigured: apiKeyConfigured,
        agentConfigured,
        agentVerified,
      },
      telephony: {
        mode: telephonyMatrix.mode.toUpperCase(),
        readiness: telephonyMatrix.readiness,
        providerHealth: telephonyHealth,
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
