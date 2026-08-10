import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';

export async function GET(request: NextRequest) {
  const workspace = await requireWorkspaceAccess(request);
  if ('errorResponse' in workspace) return workspace.errorResponse;
  try {
    const conversations = await prisma.conversation.findMany({
      where: { workspaceId: workspace.workspaceId },
      orderBy: { startedAt: 'desc' },
      take: 100,
      select: {
        id: true,
        channel: true,
        direction: true,
        status: true,
        intent: true,
        outcome: true,
        languageCode: true,
        startedAt: true,
        durationSeconds: true,
        requiresReview: true,
        contact: { select: { name: true, company: true } },
        agent: { select: { name: true } },
      },
    });
    return NextResponse.json({ data: conversations, meta: { count: conversations.length } });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'Conversations are temporarily unavailable.',
        },
      },
      { status: 503 }
    );
  }
}
