import type { AvailableSlot, CalendarAppointmentRecord, CalendarProvider } from './interface';

const MESSAGE =
  'Cal.com is not configured with a verified production adapter. No calendar action was performed.';

export class CalComProvider implements CalendarProvider {
  public readonly providerType = 'CALCOM';

  private unavailable(): never {
    throw new Error(MESSAGE);
  }

  async listServices(): Promise<string[]> {
    return this.unavailable();
  }

  async checkAvailability(): Promise<AvailableSlot[]> {
    return this.unavailable();
  }

  async createAppointment(): Promise<CalendarAppointmentRecord> {
    return this.unavailable();
  }

  async rescheduleAppointment(): Promise<CalendarAppointmentRecord> {
    return this.unavailable();
  }

  async cancelAppointment(): Promise<boolean> {
    return this.unavailable();
  }

  async getAppointment(): Promise<CalendarAppointmentRecord | null> {
    return this.unavailable();
  }
}

