import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    const [userCount, workspaceCount, callCount, leadCount] = await Promise.all([
      prisma.user.count(),
      prisma.workspace.count(),
      prisma.call.count(),
      prisma.lead.count(),
    ]);

    return NextResponse.json({
      status: 'HEALTHY',
      timestamp: new Date().toISOString(),
      database: {
        latencyMs: latency,
        stats: {
          users: userCount,
          workspaces: workspaceCount,
          calls: callCount,
          leads: leadCount,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'UNHEALTHY', error: error.message }, { status: 500 });
  }
}
