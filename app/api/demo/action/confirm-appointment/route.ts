import { NextRequest, NextResponse } from 'next/server';
import { getDemoSessionFromCookieToken } from '@/lib/demo/session';

export async function POST(req: NextRequest) {
  const cookieToken = req.cookies.get('voxdesk_demo_session')?.value;
  const session = cookieToken ? await getDemoSessionFromCookieToken(cookieToken) : null;

  if (!session) {
    return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
  }

  const appointmentId = `demo_apt_${Math.floor(100000 + Math.random() * 900000)}`;

  return NextResponse.json({
    success: true,
    appointment: {
      id: appointmentId,
      workspaceId: 'northstar-legal-ws',
      callerName: 'Sarah Miller',
      service: 'Legal Consultation',
      startTime: new Date(Date.now() + 24 * 3600 * 1000 * 2).toISOString(),
      status: 'CONFIRMED',
      assignedAgent: 'Maya',
    },
  });
}
