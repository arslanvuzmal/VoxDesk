import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ status: 'NOT_CONFIGURED', configured: false, verified: false });
  }
  try {
    const [queued, deadLetter] = await Promise.all([
      prisma.backgroundJob.count({ where: { status: { in: ['PENDING', 'RETRY'] } } }),
      prisma.backgroundJob.count({ where: { status: 'DEAD_LETTER' } }),
    ]);
    return NextResponse.json({
      status: deadLetter > 0 ? 'DEGRADED' : 'HEALTHY',
      configured: true,
      verified: true,
      queueDepth: queued,
      deadLetter,
    });
  } catch {
    return NextResponse.json(
      { status: 'UNAVAILABLE', configured: true, verified: false },
      { status: 503 }
    );
  }
}
