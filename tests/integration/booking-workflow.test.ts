import { describe, it, expect } from 'vitest';
import { DemoCalendarProvider } from '../../lib/calendar/demo-calendar';

describe('Appointment Booking Workflow Integration', () => {
  it('should check availability and create confirmed appointment', async () => {
    const calendar = new DemoCalendarProvider();
    const slots = await calendar.checkAvailability(
      'Legal Consultation',
      new Date(),
      'America/New_York'
    );
    expect(slots.length).toBeGreaterThan(0);

    const targetSlot = slots[0];
    const appointment = await calendar.createAppointment({
      workspaceId: 'northstar-legal-ws',
      callerName: 'Sarah Miller',
      service: 'Legal Consultation',
      startTime: targetSlot.startTime,
      endTime: targetSlot.endTime,
      timezone: 'America/New_York',
    });

    expect(appointment.status).toBe('CONFIRMED');
    expect(appointment.callerName).toBe('Sarah Miller');
  });
});
