import { NextRequest, NextResponse } from 'next/server';
import { demoSessionStore } from '@/lib/demo/store';
import { env } from '@/lib/config/env';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');

    // Preview and production reset is always an explicitly authenticated maintenance action.
    // Local development remains convenient without making public demo deployments mutable.
    const isAllowed =
      process.env.NODE_ENV !== 'production' || authHeader === `Bearer ${env.INTERNAL_API_SECRET}`;

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid administrative secret.' },
        { status: 401 }
      );
    }

    // Reset rate limits and active session store
    await demoSessionStore.clearAllSessions();

    return NextResponse.json({
      success: true,
      message: 'Demo session limits, cooldowns, and active session counters cleared.',
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to reset demo store.' }, { status: 500 });
  }
}
