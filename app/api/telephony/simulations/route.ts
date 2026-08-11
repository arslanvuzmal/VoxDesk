import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';
import {
  runTelephonySimulation,
  SIMULATION_SCENARIOS,
  SimulationConfigurationError,
} from '@/lib/telephony/simulation/run-simulation';

const SimulationRequestSchema = z.object({
  scenario: z.enum(SIMULATION_SCENARIOS),
});

export async function POST(request: NextRequest) {
  const access = await requireWorkspaceAccess(request, undefined, 'conversations:start');
  if ('errorResponse' in access) return access.errorResponse;
  const parsed = SimulationRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'A supported simulation scenario is required.' } },
      { status: 400 }
    );
  }
  try {
    const data = await runTelephonySimulation({
      workspaceId: access.workspaceId,
      initiatedBy: access.userId,
      scenario: parsed.data.scenario,
    });
    return NextResponse.json(
      { data, meta: { correlationId: `sim_${data.callId}` } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof SimulationConfigurationError) {
      return NextResponse.json(
        { error: { code: 'SIMULATION_NOT_READY', message: error.message } },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: { code: 'SIMULATION_FAILED', message: 'The simulation could not be completed.' } },
      { status: 500 }
    );
  }
}
