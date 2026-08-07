import { NextRequest, NextResponse } from 'next/server';
import { getDemoSessionFromCookieToken } from '@/lib/demo/session';
import { demoSessionStore } from '@/lib/demo/store';

export async function POST(req: NextRequest) {
  const correlationId = `req_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;

  try {
    const cookieToken = req.cookies.get('voxdesk_demo_session')?.value;
    if (!cookieToken) {
      return NextResponse.json({ success: true, message: 'No active session' }, { status: 200 });
    }

    const session = await getDemoSessionFromCookieToken(cookieToken);
    if (!session) {
      return NextResponse.json({ success: true, message: 'No active session' }, { status: 200 });
    }

    if (session.activeSTTConnection) {
      const connectedDurationSeconds = session.sttTokenIssuedAt
        ? Math.max(1, Math.floor((Date.now() - session.sttTokenIssuedAt) / 1000))
        : 0;
      await demoSessionStore.updateSession(session.sessionId, {
        activeSTTConnection: false,
        sttSeconds: session.sttSeconds + connectedDurationSeconds,
      });
    }

    return NextResponse.json({ success: true, correlationId });
  } catch (error) {
    console.error(`[STT DISCONNECT ERROR] correlationId=${correlationId}:`, error);
    return NextResponse.json({ success: true, correlationId }, { status: 200 });
  }
}
