import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    let call: any = null;
    try {
      call = await prisma.call.findUnique({
        where: { id },
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
          success: false,
          code: 'DATABASE_UNAVAILABLE',
          message: 'Call detail data is temporarily unavailable.',
        },
        { status: 503 }
      );
    }

    if (!call) {
      return NextResponse.json(
        {
          success: false,
          code: 'CALL_NOT_FOUND',
          message: `Call record '${id}' was not found.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      call,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        code: 'INTERNAL_ERROR',
        message: error?.message || 'Failed to fetch call detail',
      },
      { status: 500 }
    );
  }
}
