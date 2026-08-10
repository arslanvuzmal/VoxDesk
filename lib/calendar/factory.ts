import { CalendarProvider } from './interface';
import { DemoCalendarProvider } from './demo-calendar';
import { GoogleCalendarProvider } from './google-calendar';
import { CalComProvider } from './calcom-calendar';

export function getCalendarProvider(providerType: string): CalendarProvider {
  switch (providerType.toUpperCase()) {
    case 'DEMO':
      return new DemoCalendarProvider();
    case 'GOOGLE_CALENDAR':
      return new GoogleCalendarProvider();
    case 'CALCOM':
      return new CalComProvider();
    default:
      throw new Error(`Calendar provider '${providerType}' is not supported.`);
  }
}

