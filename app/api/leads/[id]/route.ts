import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const workspace = await requireWorkspaceAccess(req, undefined, 'calls:view');
    if ('errorResponse' in workspace) return workspace.errorResponse;

    let lead: any = null;
    try {
      lead = await prisma.lead.findFirst({
        where: { id, workspaceId: workspace.workspaceId },
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
          message: 'Lead record was not found.',
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
