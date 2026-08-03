import {
  CalendarProvider,
  AvailableSlot,
  AppointmentCreateInput,
  CalendarAppointmentRecord,
} from "./interface";

export class CalComProvider implements CalendarProvider {
  public readonly providerType = "CALCOM";
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.CALCOM_API_KEY || "";
  }

  async listServices(): Promise<string[]> {
    return ["Cal.com Strategy Session (30 mins)", "Cal.com Technical Onboarding (60 mins)"];
  }

  async checkAvailability(_service: string, targetDate: Date, _timezone: string): Promise<AvailableSlot[]> {
    const slot = new Date(targetDate);
    slot.setHours(11, 0, 0, 0);
    return [
      {
        startTime: slot,
        endTime: new Date(slot.getTime() + 30 * 60 * 1000),
        formattedTime: "11:00 AM EST",
        available: true,
      },
    ];
  }

  async createAppointment(input: AppointmentCreateInput): Promise<CalendarAppointmentRecord> {
    return {
      id: `calcom-${Date.now()}`,
      externalEventId: `calcom-booking-${Date.now()}`,
      callerName: input.callerName,
      service: input.service,
      startTime: input.startTime,
      endTime: input.endTime,
      timezone: input.timezone,
      status: "CONFIRMED",
    };
  }

  async rescheduleAppointment(appointmentId: string, newStartTime: Date, timezone: string): Promise<CalendarAppointmentRecord> {
    return {
      id: appointmentId,
      externalEventId: `calcom-${appointmentId}`,
      callerName: "Caller",
      service: "Strategy Session",
      startTime: newStartTime,
      endTime: new Date(newStartTime.getTime() + 30 * 60 * 1000),
      timezone,
      status: "RESCHEDULED",
    };
  }

  async cancelAppointment(_appointmentId: string): Promise<boolean> {
    return true;
  }

  async getAppointment(appointmentId: string): Promise<CalendarAppointmentRecord | null> {
    return {
      id: appointmentId,
      externalEventId: `calcom-${appointmentId}`,
      callerName: "Daniel Brooks",
      service: "Strategy Session",
      startTime: new Date(),
      endTime: new Date(Date.now() + 30 * 60 * 1000),
      timezone: "America/New_York",
      status: "CONFIRMED",
    };
  }
}
