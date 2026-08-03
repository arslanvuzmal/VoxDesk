import {
  CalendarProvider,
  AvailableSlot,
  AppointmentCreateInput,
  CalendarAppointmentRecord,
} from "./interface";

export class DemoCalendarProvider implements CalendarProvider {
  public readonly providerType = "DEMO";
  private appointments: Map<string, CalendarAppointmentRecord> = new Map();

  async listServices(): Promise<string[]> {
    return [
      "Initial Legal Consultation (30 mins)",
      "Contract Review & Advice (60 mins)",
      "Dental Examination & Hygiene (45 mins)",
      "Property Valuation Inspection (60 mins)",
    ];
  }

  async checkAvailability(_service: string, targetDate: Date, _timezone: string): Promise<AvailableSlot[]> {
    const base = new Date(targetDate);
    base.setHours(14, 0, 0, 0); // 2:00 PM

    const slot1End = new Date(base.getTime() + 30 * 60 * 1000);

    const slot2 = new Date(targetDate);
    slot2.setHours(15, 30, 0, 0); // 3:30 PM
    const slot2End = new Date(slot2.getTime() + 30 * 60 * 1000);

    return [
      {
        startTime: base,
        endTime: slot1End,
        formattedTime: "Tuesday at 2:00 PM EST",
        available: true,
      },
      {
        startTime: slot2,
        endTime: slot2End,
        formattedTime: "Tuesday at 3:30 PM EST",
        available: true,
      },
    ];
  }

  async createAppointment(input: AppointmentCreateInput): Promise<CalendarAppointmentRecord> {
    const id = `demo-appt-${Date.now()}`;
    const record: CalendarAppointmentRecord = {
      id,
      externalEventId: `evt-demo-${Math.random().toString(36).substring(7)}`,
      callerName: input.callerName,
      service: input.service,
      startTime: input.startTime,
      endTime: input.endTime,
      timezone: input.timezone,
      status: "CONFIRMED",
    };
    this.appointments.set(id, record);
    return record;
  }

  async rescheduleAppointment(appointmentId: string, newStartTime: Date, _timezone: string): Promise<CalendarAppointmentRecord> {
    const existing = this.appointments.get(appointmentId);
    if (!existing) {
      throw new Error(`Appointment '${appointmentId}' not found`);
    }
    existing.startTime = newStartTime;
    existing.endTime = new Date(newStartTime.getTime() + 30 * 60 * 1000);
    existing.status = "RESCHEDULED";
    return existing;
  }

  async cancelAppointment(appointmentId: string): Promise<boolean> {
    const existing = this.appointments.get(appointmentId);
    if (existing) {
      existing.status = "CANCELLED";
      return true;
    }
    return false;
  }

  async getAppointment(appointmentId: string): Promise<CalendarAppointmentRecord | null> {
    return this.appointments.get(appointmentId) || null;
  }
}
