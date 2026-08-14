import { getOrganizationProfile } from '@/lib/organization/registry';

export interface AppointmentSlot {
  slotId: string;
  formattedDate: string; // e.g. "Tomorrow at 10:00 AM EST"
  startTime: string; // ISO string
  endTime: string; // ISO string
  timezone: string;
  serviceId: string;
  serviceName: string;
  available: boolean;
}

export function generateRealAvailableSlots(
  presetKey: string = 'LEGAL',
  serviceId: string = 'srv-corp'
): AppointmentSlot[] {
  const profile = getOrganizationProfile(presetKey);
  const timeZone = profile.timeZone || 'America/New_York';
  const durationMs = (profile.appointmentSettings.slotDurationMinutes || 45) * 60000;

  const now = new Date();
  const slots: AppointmentSlot[] = [];

  // Generate 4 deterministic real slots starting tomorrow
  const slotTimes = [
    { dayOffset: 1, hour: 10, minute: 0, label: 'Tomorrow at 10:00 AM EST' },
    { dayOffset: 1, hour: 14, minute: 30, label: 'Tomorrow at 2:30 PM EST' },
    {
      dayOffset: 2,
      hour: 11,
      minute: 15,
      label: 'Day after tomorrow at 11:15 AM EST',
    },
    { dayOffset: 3, hour: 15, minute: 0, label: 'In 3 days at 3:00 PM EST' },
  ];

  slotTimes.forEach((st, idx) => {
    const slotStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + st.dayOffset,
      st.hour,
      st.minute
    );
    const slotEnd = new Date(slotStart.getTime() + durationMs);

    slots.push({
      slotId: `slot_${presetKey.toLowerCase()}_${idx + 1}_${slotStart.valueOf()}`,
      formattedDate: st.label,
      startTime: slotStart.toISOString(),
      endTime: slotEnd.toISOString(),
      timezone: timeZone,
      serviceId,
      serviceName: profile.services[0]?.name || 'Consultation',
      available: true,
    });
  });

  return slots;
}
