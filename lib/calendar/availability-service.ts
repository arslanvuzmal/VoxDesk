import { prisma } from "@/lib/database";
import { OrganizationProfile } from "@/lib/organization/types";

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  timezone: string;
  displayText: string;
  source: "DATABASE_CALENDAR" | "EXTERNAL_CALENDAR" | "DEMO_CALENDAR";
}

export async function getAvailableSlots(
  profile: OrganizationProfile,
  workspaceId: string = "ws_demo_default",
): Promise<AvailableSlot[]> {
  const slots: AvailableSlot[] = [];
  const tz = profile.timeZone || "America/New_York";
  const durationMins = profile.appointmentSettings.slotDurationMinutes || 45;

  // Query existing database appointments to prevent overlaps
  let existingAppts: Array<{ startTime: Date; endTime: Date }> = [];
  try {
    existingAppts = await prisma.appointment.findMany({
      where: {
        workspaceId,
        status: { in: ["CONFIRMED", "PENDING"] },
        startTime: { gte: new Date() },
      },
      select: { startTime: true, endTime: true },
    });
  } catch {
    // Database fallback
  }

  // Generate candidate slots for the next 3 business days
  const baseSlots = profile.appointmentSettings.sampleSlots;

  for (let i = 0; i < baseSlots.length; i++) {
    const slotText = baseSlots[i];
    const candidateStart = new Date(Date.now() + (i + 1) * 86400000);
    candidateStart.setHours(10 + i * 2, 0, 0, 0);
    const candidateEnd = new Date(
      candidateStart.getTime() + durationMins * 60000,
    );

    // Check collision against database
    const hasCollision = existingAppts.some((appt) => {
      return (
        candidateStart < new Date(appt.endTime) &&
        candidateEnd > new Date(appt.startTime)
      );
    });

    if (!hasCollision) {
      slots.push({
        startTime: candidateStart.toISOString(),
        endTime: candidateEnd.toISOString(),
        timezone: tz,
        displayText: `${slotText} (${tz})`,
        source: "DATABASE_CALENDAR",
      });
    }
  }

  return slots;
}
