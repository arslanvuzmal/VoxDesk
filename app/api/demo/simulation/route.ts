import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDemoSessionFromCookieToken } from '@/lib/demo/session';
import { prisma } from '@/lib/database';
import { env } from '@/lib/config/env';
import {
  runTelephonySimulation,
  SimulationConfigurationError,
  SIMULATION_SCENARIOS,
} from '@/lib/telephony/simulation/run-simulation';

const RequestSchema = z.object({
  scenario: z.enum(['BOOKING', 'QUALIFICATION', 'ESCALATION', 'ROUTINE']),
});

const scenarioMap = {
  BOOKING: 'appointment-booked',
  QUALIFICATION: 'qualified-lead',
  ESCALATION: 'human-escalation',
  ROUTINE: 'support-resolution',
} as const;

export async function POST(request: NextRequest) {
  const token = request.cookies.get('voxdesk_demo_session')?.value;
  const session = token ? await getDemoSessionFromCookieToken(token) : null;
  if (!session) {
    return NextResponse.json(
      {
        error: {
          code: 'DEMO_SESSION_REQUIRED',
          message: 'Start a demo session before running a simulation.',
        },
      },
      { status: 401, headers: { 'Cache-Control': 'no-store, private' } }
    );
  }

  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: { code: 'VALIDATION', message: 'A supported simulation scenario is required.' },
      },
      { status: 400 }
    );
  }

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { slug: env.DEMO_WORKSPACE_SLUG },
      select: { id: true },
    });
    if (!workspace) {
      return NextResponse.json(
        {
          error: {
            code: 'DEMO_NOT_CONFIGURED',
            message: 'The demonstration workspace is not configured.',
          },
        },
        { status: 409 }
      );
    }

    const scenario = scenarioMap[parsed.data.scenario];
    if (!(SIMULATION_SCENARIOS as readonly string[]).includes(scenario)) {
      return NextResponse.json(
        {
          error: { code: 'VALIDATION', message: 'The selected simulation is not available.' },
        },
        { status: 400 }
      );
    }

    const data = await runTelephonySimulation({
      workspaceId: workspace.id,
      initiatedBy: `demo-session:${session.sessionId}`,
      scenario: scenario as (typeof SIMULATION_SCENARIOS)[number],
    });

    return NextResponse.json(
      { data, meta: { correlationId: `demo_sim_${data.callId}` } },
      { status: 201, headers: { 'Cache-Control': 'no-store, private' } }
    );
  } catch (error) {
    if (error instanceof SimulationConfigurationError) {
      return NextResponse.json(
        { error: { code: 'DEMO_NOT_READY', message: error.message } },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        error: {
          code: 'DEMO_SIMULATION_FAILED',
          message: 'The demonstration could not be completed.',
        },
      },
      { status: 500 }
    );
  }
}
