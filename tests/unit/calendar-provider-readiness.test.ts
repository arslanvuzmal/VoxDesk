import { describe, expect, it } from 'vitest';
import { getCalendarProvider } from '@/lib/calendar/factory';

describe('calendar provider readiness', () => {
  it('requires the demo adapter to be selected explicitly', () => {
    expect(getCalendarProvider('DEMO').providerType).toBe('DEMO');
    expect(() => getCalendarProvider('UNKNOWN')).toThrow(/not supported/);
  });

  it.each(['GOOGLE_CALENDAR', 'CALCOM'])('%s fails honestly without an adapter', async provider => {
    const calendar = getCalendarProvider(provider);

    await expect(calendar.listServices()).rejects.toThrow(/No calendar action was performed/);
  });
});
