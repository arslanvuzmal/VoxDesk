const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function minutes(value: string): number | null {
  if (!TIME_PATTERN.test(value)) return null;
  const [hours, mins] = value.split(':').map(Number);
  return hours * 60 + mins;
}

export function isWithinCallingWindow(
  start: string,
  end: string,
  timeZone: string,
  now: Date = new Date()
): boolean {
  const startMinutes = minutes(start);
  const endMinutes = minutes(end);
  if (startMinutes === null || endMinutes === null) return false;

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(now);
    const hour = Number(parts.find(part => part.type === 'hour')?.value);
    const minute = Number(parts.find(part => part.type === 'minute')?.value);
    if (!Number.isInteger(hour) || !Number.isInteger(minute)) return false;
    const current = hour * 60 + minute;

    return startMinutes <= endMinutes
      ? current >= startMinutes && current <= endMinutes
      : current >= startMinutes || current <= endMinutes;
  } catch {
    return false;
  }
}

