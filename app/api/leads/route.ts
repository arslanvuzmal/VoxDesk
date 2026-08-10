import { NextRequest, NextResponse } from 'next/server';
import { LeadCategory, Prisma } from '@prisma/client';
import { prisma } from '@/lib/database';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';

const LEAD_CATEGORIES = new Set<string>(Object.values(LeadCategory));

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const workspace = await requireWorkspaceAccess(
      req,
      searchParams.get('workspaceId') || undefined,
      'calls:view'
    );
    if ('errorResponse' in workspace) return workspace.errorResponse;

    const whereClause: Prisma.LeadWhereInput = {
      workspaceId: workspace.workspaceId,
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { serviceInterest: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'ALL') {
      if (!LEAD_CATEGORIES.has(category)) {
        return NextResponse.json({ error: 'Invalid lead category.' }, { status: 400 });
      }
      whereClause.category = category as LeadCategory;
    }

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    try {
      const leads = await prisma.lead.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          call: {
            include: {
              summary: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        count: leads.length,
        leads,
      });
    } catch {
      return NextResponse.json(
        {
          success: false,
          code: 'DATABASE_UNAVAILABLE',
          message: 'Lead data is temporarily unavailable.',
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        code: 'INTERNAL_ERROR',
        message: error?.message || 'Failed to fetch leads',
      },
      { status: 500 }
    );
  }
}

