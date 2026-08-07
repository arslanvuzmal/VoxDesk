import { prisma } from '@/lib/database';
import { OrganizationProfile } from '@/lib/organization/types';

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  timezone: string;
  displayText: string;
  source: 'DATABASE_CALENDAR' | 'EXTERNAL_CALENDAR';
}

export async function getAvailableSlots(
  profile: OrganizationProfile,
  preferredDate?: string,
  workspaceId: string = 'ws_demo_default'
): Promise<AvailableSlot[]> {
  const slots: AvailableSlot[] = [];
  const tz = profile.timeZone || 'America/New_York';
  const durationMins = profile.appointmentSettings?.slotDurationMinutes || 45;

  // Query database appointments
  const existingAppts = await prisma.appointment.findMany({
    where: {
      workspaceId,
      status: { in: ['CONFIRMED', 'PENDING'] },
      startTime: { gte: new Date() },
    },
    select: { startTime: true, endTime: true },
  });

  // Calculate slots dynamically for next 3 business days
  const baseDate = preferredDate ? new Date(preferredDate) : new Date();
  if (isNaN(baseDate.getTime())) {
    baseDate.setTime(Date.now());
  }

  for (let dayOffset = 1; dayOffset <= 3; dayOffset++) {
    const candidateDay = new Date(baseDate.getTime() + dayOffset * 86400000);
    // Skip weekends if operating hours define business days
    const dayOfWeek = candidateDay.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    for (let hour = 10; hour <= 15; hour += 2) {
      const candidateStart = new Date(candidateDay);
      candidateStart.setHours(hour, 0, 0, 0);

      // Enforce 4-hour advance notice
      if (candidateStart.getTime() - Date.now() < 4 * 3600 * 1000) continue;

      const candidateEnd = new Date(candidateStart.getTime() + durationMins * 60000);

      // Check overlap collision
      const hasCollision = existingAppts.some((appt: any) => {
        return candidateStart < appt.endTime && candidateEnd > appt.startTime;
      });

      if (!hasCollision) {
        const timeStr = candidateStart.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        const dateStr = candidateStart.toLocaleDateString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });

        slots.push({
          startTime: candidateStart.toISOString(),
          endTime: candidateEnd.toISOString(),
          timezone: tz,
          displayText: `${dateStr} at ${timeStr} (${tz})`,
          source: 'DATABASE_CALENDAR',
        });

        if (slots.length >= 4) break;
      }
    }
    if (slots.length >= 4) break;
  }

  return slots;
}
