import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const workspace = await requireWorkspaceAccess(req);
    if ('errorResponse' in workspace) return workspace.errorResponse;

    let call = null;
    try {
      call = await prisma.call.findFirst({
        where: { id, workspaceId: workspace.workspaceId },
        include: {
          summary: true,
          transcriptSegments: {
            orderBy: { startMs: 'asc' },
          },
          lead: true,
          appointment: true,
          events: true,
        },
      });
    } catch {
      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_UNAVAILABLE',
            message: 'Call detail data is temporarily unavailable.',
          },
        },
        { status: 503 }
      );
    }

    if (!call) {
      return NextResponse.json(
        {
          error: { code: 'CALL_NOT_FOUND', message: 'Call record was not found.' },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: call,
    });
  } catch {
    return NextResponse.json(
      {
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch call detail.' },
      },
      { status: 500 }
    );
  }
}

