import { NextRequest, NextResponse } from 'next/server';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/database';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';

const APPOINTMENT_STATUSES = new Set<string>(Object.values(AppointmentStatus));

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const workspace = await requireWorkspaceAccess(
      req,
      searchParams.get('workspaceId') || undefined,
      'calls:view'
    );
    if ('errorResponse' in workspace) return workspace.errorResponse;

    const whereClause: Prisma.AppointmentWhereInput = {
      workspaceId: workspace.workspaceId,
    };

    if (status && status !== 'ALL') {
      if (!APPOINTMENT_STATUSES.has(status)) {
        return NextResponse.json({ error: 'Invalid appointment status.' }, { status: 400 });
      }
      whereClause.status = status as AppointmentStatus;
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
  } catch {
    return NextResponse.json(
      {
        success: false,
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch appointments.',
      },
      { status: 500 }
    );
  }
}
