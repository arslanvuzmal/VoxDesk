import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    return NextResponse.json({
      status: 'HEALTHY',
      timestamp: new Date().toISOString(),
      database: { configured: true, verified: true, latencyMs: latency },
    });
  } catch {
    return NextResponse.json(
      {
        status: process.env.DATABASE_URL ? 'UNAVAILABLE' : 'NOT_CONFIGURED',
        timestamp: new Date().toISOString(),
        database: { configured: Boolean(process.env.DATABASE_URL), verified: false },
      },
      { status: 503 }
    );
  }
}

