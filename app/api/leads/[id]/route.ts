import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    let lead: any = null;
    try {
      lead = await prisma.lead.findUnique({
        where: { id },
        include: {
          call: {
            include: {
              summary: true,
              transcriptSegments: {
                orderBy: { startMs: 'asc' },
              },
              appointment: true,
            },
          },
        },
      });
    } catch {
      return NextResponse.json(
        {
          success: false,
          code: 'DATABASE_UNAVAILABLE',
          message: 'Lead detail data is temporarily unavailable.',
        },
        { status: 503 }
      );
    }

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          code: 'LEAD_NOT_FOUND',
          message: `Lead record '${id}' was not found.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      lead,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        code: 'INTERNAL_ERROR',
        message: error?.message || 'Failed to fetch lead detail',
      },
      { status: 500 }
    );
  }
}
