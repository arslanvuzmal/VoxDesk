import { NextRequest, NextResponse } from 'next/server';
import { getCalendarProvider } from '@/lib/calendar/factory';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const calendar = getCalendarProvider(body.provider || 'DEMO');

    const appointment = await calendar.createAppointment({
      workspaceId: body.workspaceId || 'northstar-legal-ws',
      callerName: body.callerName || 'Sarah Miller',
      callerPhone: body.callerPhone || '+15550192834',
      service: body.service || 'Initial Legal Consultation',
      startTime: new Date(body.startTime || Date.now() + 86400000 * 2),
      endTime: new Date(body.endTime || Date.now() + 86400000 * 2 + 1800000),
      timezone: body.timezone || 'America/New_York',
    });

    return NextResponse.json({
      success: true,
      appointment,
      message: 'Appointment confirmed successfully',
    });
  } catch (error) {
    console.error('Calendar Book API Error:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
