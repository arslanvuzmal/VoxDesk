import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { verifyDemoSessionToken } from '@/lib/security/session-token';
import { prisma } from '@/lib/database';
import { syncConversationProjection } from '@/lib/conversation/persistence';

const TranscriptLineSchema = z.object({
  id: z.string().max(200),
  role: z.enum(['CALLER', 'AGENT']),
  text: z.string().max(4000),
  final: z.boolean(),
  createdAt: z.string().datetime(),
  providerEventId: z.string().max(200).optional(),
});

const FinalizeSchema = z.object({
  providerConversationId: z.string().min(1).max(300).nullable(),
  transcript: z.array(TranscriptLineSchema).max(300).default([]),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime(),
  terminationReason: z.enum(['USER_ENDED', 'TIME_LIMIT', 'PROVIDER_DISCONNECTED', 'ERROR']),
});

export async function POST(req: Request) {
  const sessionCookie = (await cookies()).get('voxdesk_demo_session')?.value;
  const session = sessionCookie ? verifyDemoSessionToken(sessionCookie) : null;
  if (!session) {
    return NextResponse.json(
      { error: 'AUTHENTICATION', message: 'A valid demo session is required.' },
      { status: 401, headers: { 'Cache-Control': 'no-store, private' } }
    );
  }

  const parsed = FinalizeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'VALIDATION', message: 'Invalid finalization payload.' },
      { status: 400, headers: { 'Cache-Control': 'no-store, private' } }
    );
  }

  const { providerConversationId, transcript, startedAt, endedAt } = parsed.data;
  const startMs = new Date(startedAt).getTime();
  const endMs = new Date(endedAt).getTime();
  if (endMs < startMs || endMs - startMs > 240_000) {
    return NextResponse.json(
      { error: 'VALIDATION', message: 'Invalid demo session duration.' },
      { status: 400, headers: { 'Cache-Control': 'no-store, private' } }
    );
  }

  const callerTurns = transcript.filter(turn => turn.role === 'CALLER').length;
  const agentTurns = transcript.filter(turn => turn.role === 'AGENT').length;
  const warnings: string[] = [];
  let persistenceStatus: 'PERSISTED' | 'NOT_CONFIGURED' | 'FAILED' = 'NOT_CONFIGURED';
  let callId: string | undefined;

  if (!process.env.DATABASE_URL) {
    warnings.push('Database is not configured; provider reconciliation is pending externally.');
  } else {
    try {
      if (!providerConversationId) {
        warnings.push(
          'Provider conversation ID is pending; no CRM record was created from browser state.'
        );
      } else {
        const workspace = await prisma.workspace.findFirst({
          where: { slug: 'demo-workspace' },
          select: { id: true },
        });
        const agent = workspace
          ? await prisma.voiceAgent.findFirst({
              where: { workspaceId: workspace.id, voiceProvider: 'ELEVENLABS', status: 'ACTIVE' },
              select: { id: true },
            })
          : null;
        if (workspace && agent) {
          const existing = await prisma.call.findFirst({
            where: { workspaceId: workspace.id, providerConversationId },
            select: { id: true },
          });
          const call =
            existing ||
            (await prisma.call.create({
              data: {
                workspaceId: workspace.id,
                agentId: agent.id,
                provider: 'ELEVENLABS',
                providerConversationId,
                callerNumberMasked: 'Not provided',
                language: session.language,
                channel: 'WEB',
                status: 'IN_PROGRESS',
                startedAt: new Date(startMs),
              },
              select: { id: true },
            }));
          callId = call.id;
          persistenceStatus = 'PERSISTED';
          await syncConversationProjection(call.id);
        } else {
          warnings.push('The isolated demo workspace or ElevenLabs agent is not configured.');
        }
      }
    } catch {
      persistenceStatus = 'FAILED';
      warnings.push('Call metadata could not be persisted. No CRM completion was claimed.');
    }
  }

  return NextResponse.json(
    {
      success: true,
      result: {
        sessionId: session.sessionId,
        providerConversationId,
        durationSeconds: Math.round((endMs - startMs) / 1000),
        callerTurns,
        agentTurns,
        persistenceStatus,
        providerDataStatus: providerConversationId
          ? 'PENDING_RECONCILIATION'
          : 'PROVIDER_DATA_MISSING',
        callId,
        warnings,
      },
    },
    { status: 200, headers: { 'Cache-Control': 'no-store, private' } }
  );
}
