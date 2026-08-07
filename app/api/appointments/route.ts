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
      const appointments = await prisma.appointment.findMany({
        where: whereClause,
        orderBy: { startTime: 'asc' },
        take: 50,
        include: {
          call: {
            include: {
              lead: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        count: appointments.length,
        appointments,
      });
    } catch {
      return NextResponse.json(
        {
          success: false,
          code: 'DATABASE_UNAVAILABLE',
          message: 'Appointments data is temporarily unavailable.',
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        code: 'INTERNAL_ERROR',
        message: error?.message || 'Failed to fetch appointments',
      },
      { status: 500 }
    );
  }
}
