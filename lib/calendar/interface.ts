export interface AvailableSlot {
  startTime: Date;
  endTime: Date;
  formattedTime: string;
  available: boolean;
}

export interface AppointmentCreateInput {
  workspaceId: string;
  callerName: string;
  callerPhone?: string;
  service: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
}

export interface CalendarAppointmentRecord {
  id: string;
  externalEventId: string;
  callerName: string;
  service: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  status: "CONFIRMED" | "RESCHEDULED" | "CANCELLED";
}

export interface CalendarProvider {
  providerType: string;
  listServices(): Promise<string[]>;
  checkAvailability(
    service: string,
    targetDate: Date,
    timezone: string,
  ): Promise<AvailableSlot[]>;
  createAppointment(
    input: AppointmentCreateInput,
  ): Promise<CalendarAppointmentRecord>;
  rescheduleAppointment(
    appointmentId: string,
    newStartTime: Date,
    timezone: string,
  ): Promise<CalendarAppointmentRecord>;
  cancelAppointment(appointmentId: string): Promise<boolean>;
  getAppointment(
    appointmentId: string,
  ): Promise<CalendarAppointmentRecord | null>;
}
