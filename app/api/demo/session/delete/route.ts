import { NextRequest, NextResponse } from 'next/server';
import { getDemoSessionFromCookieToken } from '@/lib/demo/session';
import { demoSessionStore } from '@/lib/demo/store';
import { prisma } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get('voxdesk_demo_session')?.value;
    const session = cookieToken ? await getDemoSessionFromCookieToken(cookieToken) : null;

    if (session) {
      await demoSessionStore.deleteSession(session.sessionId);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Demo session data and temporary records successfully deleted.',
    });

    response.cookies.delete('voxdesk_demo_session');
    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to delete demo session data.' }, { status: 500 });
  }
}
