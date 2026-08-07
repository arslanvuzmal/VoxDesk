import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const whereClause: any = {
      workspaceId: 'ws_demo_default',
    };

    if (status && status !== 'ALL') {
      whereClause.status = status;
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

      return NextResponse.json({
        success: true,
        count: calls.length,
        calls,
      });
    } catch {
      return NextResponse.json(
        {
          success: false,
          code: 'DATABASE_UNAVAILABLE',
          message: 'Calls data is temporarily unavailable.',
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        code: 'INTERNAL_ERROR',
        message: error?.message || 'Failed to fetch calls',
      },
      { status: 500 }
    );
  }
}
