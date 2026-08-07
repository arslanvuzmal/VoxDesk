import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyDemoSessionToken } from '@/lib/security/session-token';
import { prisma } from '@/lib/database';

interface VoiceTranscriptLine {
  id: string;
  role: 'CALLER' | 'AGENT';
  text: string;
  final: boolean;
  createdAt: string;
  providerEventId?: string;
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('voxdesk_demo_session')?.value;

  let sessionPayload = sessionCookie ? verifyDemoSessionToken(sessionCookie) : null;

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'INVALID_JSON', message: 'Invalid JSON body.' },
      { status: 400, headers: { 'Cache-Control': 'no-store, private' } }
    );
  }

  const {
    providerConversationId,
    transcript = [],
    startedAt,
    endedAt,
    terminationReason = 'USER_ENDED',
  } = body;

  const sessionId = sessionPayload?.sessionId || body.sessionId || 'untracked_session';

  const startMs = startedAt ? new Date(startedAt).getTime() : Date.now() - 30000;
  const endMs = endedAt ? new Date(endedAt).getTime() : Date.now();
  const durationSeconds = Math.max(1, Math.round((endMs - startMs) / 1000));

  const callerTurns = (transcript as VoiceTranscriptLine[]).filter(t => t.role === 'CALLER').length;
  const agentTurns = (transcript as VoiceTranscriptLine[]).filter(t => t.role === 'AGENT').length;

  const warnings: string[] = [];
  let persistenceStatus: 'PERSISTED' | 'NOT_CONFIGURED' | 'FAILED' = 'NOT_CONFIGURED';
  let callId: string | undefined = undefined;

  const dbConfigured = Boolean(process.env.DATABASE_URL);
  if (!dbConfigured) {
    persistenceStatus = 'NOT_CONFIGURED';
    warnings.push('Database is not configured; call metadata was not persisted.');
  } else {
    try {
      const workspace = await prisma.workspace.findFirst({
        where: { slug: 'demo-workspace' },
      });
      const agent = await prisma.voiceAgent.findFirst();

      if (workspace && agent) {
        const call = await prisma.call.create({
          data: {
            workspaceId: workspace.id,
            agentId: agent.id,
            provider: 'ELEVENLABS',
            providerCallControlId: providerConversationId || null,
            callerNumberMasked: '+1 (555) ***-****',
            durationSeconds,
            startedAt: new Date(startMs),
            endedAt: new Date(endMs),
            status: 'COMPLETED',
          },
        });
        callId = call.id;
        persistenceStatus = 'PERSISTED';
      } else {
        persistenceStatus = 'NOT_CONFIGURED';
        warnings.push('Demo workspace or voice agent record not seeded in database.');
      }
    } catch (dbErr: any) {
      persistenceStatus = 'FAILED';
      warnings.push(`Database persistence failed: ${dbErr?.message || dbErr}`);
    }
  }

  return NextResponse.json(
    {
      success: true,
      result: {
        sessionId,
        providerConversationId: providerConversationId || 'not_provided',
        durationSeconds,
        callerTurns,
        agentTurns,
        persistenceStatus,
        callId,
        warnings,
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
