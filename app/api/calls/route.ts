import { NextRequest, NextResponse } from 'next/server';
import { CallStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/database';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';

const CALL_STATUSES = new Set<string>(Object.values(CallStatus));

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const workspace = await requireWorkspaceAccess(
      req,
      searchParams.get('workspaceId') || undefined
    );
    if ('errorResponse' in workspace) return workspace.errorResponse;

    const whereClause: Prisma.CallWhereInput = {
      workspaceId: workspace.workspaceId,
    };

    if (status && status !== 'ALL') {
      if (!CALL_STATUSES.has(status)) {
        return NextResponse.json(
          { error: { code: 'VALIDATION', message: 'Invalid call status.' } },
          { status: 400 }
        );
      }
      whereClause.status = status as CallStatus;
    }

    try {
      const calls = await prisma.call.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          summary: true,
          lead: true,
          appointment: true,
        },
      });

      return NextResponse.json({ data: calls, meta: { count: calls.length } });
    } catch {
      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_UNAVAILABLE',
            message: 'Calls data is temporarily unavailable.',
          },
        },
        { status: 503 }
      );
    }
  } catch {
    return NextResponse.json(
      {
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch calls.' },
      },
      { status: 500 }
    );
  }
}

