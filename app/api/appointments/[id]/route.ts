import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const workspace = await requireWorkspaceAccess(req, undefined, 'calls:view');
    if ('errorResponse' in workspace) return workspace.errorResponse;

    let appointment: any = null;
    try {
      appointment = await prisma.appointment.findFirst({
        where: { id, workspaceId: workspace.workspaceId },
        include: {
          call: {
            include: {
              summary: true,
              lead: true,
            },
          },
        },
      });
    } catch {
      return NextResponse.json(
        {
          success: false,
          code: 'DATABASE_UNAVAILABLE',
          message: 'Appointment detail data is temporarily unavailable.',
        },
        { status: 503 }
      );
    }

    if (!appointment) {
      return NextResponse.json(
        {
          success: false,
          code: 'APPOINTMENT_NOT_FOUND',
          message: 'Appointment record was not found.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        code: 'INTERNAL_ERROR',
        message: error?.message || 'Failed to fetch appointment detail',
      },
      { status: 500 }
    );
  }
}

