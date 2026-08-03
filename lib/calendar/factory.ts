import { CalendarProvider } from "./interface";
import { DemoCalendarProvider } from "./demo-calendar";
import { GoogleCalendarProvider } from "./google-calendar";
import { CalComProvider } from "./calcom-calendar";

export function getCalendarProvider(
  providerType: string = "DEMO",
): CalendarProvider {
  switch (providerType.toUpperCase()) {
    case "GOOGLE_CALENDAR":
      return new GoogleCalendarProvider();
    case "CALCOM":
      return new CalComProvider();
    case "DEMO":
    default:
      return new DemoCalendarProvider();
  }
}
