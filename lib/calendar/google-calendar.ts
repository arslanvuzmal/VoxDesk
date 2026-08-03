import {
  CalendarProvider,
  AvailableSlot,
  AppointmentCreateInput,
  CalendarAppointmentRecord,
} from "./interface";

export class GoogleCalendarProvider implements CalendarProvider {
  public readonly providerType = "GOOGLE_CALENDAR";
  private clientId: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID || "";
  }

  async listServices(): Promise<string[]> {
    return ["General Consultation (30 mins)", "Follow-up Meeting (45 mins)"];
  }

  async checkAvailability(
    _service: string,
    targetDate: Date,
    _timezone: string,
  ): Promise<AvailableSlot[]> {
    const slot1 = new Date(targetDate);
    slot1.setHours(10, 0, 0, 0);
    return [
      {
        startTime: slot1,
        endTime: new Date(slot1.getTime() + 30 * 60 * 1000),
        formattedTime: "10:00 AM EST",
        available: true,
      },
    ];
  }

  async createAppointment(
    input: AppointmentCreateInput,
  ): Promise<CalendarAppointmentRecord> {
    return {
      id: `gcal-${Date.now()}`,
      externalEventId: `gcal-evt-${Date.now()}`,
      callerName: input.callerName,
      service: input.service,
      startTime: input.startTime,
      endTime: input.endTime,
      timezone: input.timezone,
      status: "CONFIRMED",
    };
  }

  async rescheduleAppointment(
    appointmentId: string,
    newStartTime: Date,
    timezone: string,
  ): Promise<CalendarAppointmentRecord> {
    return {
      id: appointmentId,
      externalEventId: `gcal-evt-${appointmentId}`,
      callerName: "Caller",
      service: "Consultation",
      startTime: newStartTime,
      endTime: new Date(newStartTime.getTime() + 30 * 60 * 1000),
      timezone,
      status: "RESCHEDULED",
    };
  }

  async cancelAppointment(_appointmentId: string): Promise<boolean> {
    return true;
  }

  async getAppointment(
    appointmentId: string,
  ): Promise<CalendarAppointmentRecord | null> {
    return {
      id: appointmentId,
      externalEventId: `gcal-${appointmentId}`,
      callerName: "Sarah Miller",
      service: "Legal Consultation",
      startTime: new Date(),
      endTime: new Date(Date.now() + 30 * 60 * 1000),
      timezone: "America/New_York",
      status: "CONFIRMED",
    };
  }
}
