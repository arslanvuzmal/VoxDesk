import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTelephonyCapabilityMatrix } from '@/lib/telephony/capability-matrix';
import { getTelephonyProvider } from '@/lib/telephony/providers/factory';

export async function GET() {
  const matrix = getTelephonyCapabilityMatrix();
  let databaseReachable = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseReachable = true;
  } catch {
    databaseReachable = false;
  }
  let providerHealth = null;

  try {
    providerHealth = await getTelephonyProvider().healthCheck();
  } catch {
    // Live mode is intentionally fail-closed. The capability matrix supplies
    // the actionable, non-sensitive activation requirements.
    providerHealth = {
      providerType: 'TELNYX',
      status: 'MISCONFIGURED',
      latencyMs: 0,
      message: 'Live PSTN activation requirements are incomplete.',
    };
  }

  return NextResponse.json(
    {
      status:
        databaseReachable &&
        (matrix.readiness === 'SIMULATION_READY' || matrix.readiness === 'LIVE_READY')
          ? 'READY'
          : databaseReachable
            ? matrix.readiness
            : 'UNAVAILABLE',
      mode: matrix.mode.toUpperCase(),
      provider: matrix.providerArchitecture,
      readiness: matrix.readiness,
      livePstn: matrix.livePstn,
      simulation: {
        ...matrix.simulation,
        verified: databaseReachable,
        status: databaseReachable ? matrix.simulation.status : 'NOT_CONFIGURED',
        reason: databaseReachable
          ? matrix.simulation.reason
          : 'The configured CRM database could not be reached.',
      },
      capabilities: matrix.capabilities,
      activationRequirements: matrix.activationRequirements,
      persistence: {
        database: { configured: Boolean(process.env.DATABASE_URL), verified: databaseReachable },
      },
      providerHealth,
    },
    { headers: { 'Cache-Control': 'no-store, private' } }
  );
}
