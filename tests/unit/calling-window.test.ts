import { describe, expect, it } from 'vitest';
import { isWithinCallingWindow } from '@/lib/telephony/outbound/calling-window';

describe('recipient-local outbound calling windows', () => {
  const noonUtc = new Date('2026-08-09T12:00:00.000Z');

  it('evaluates the window in the recipient timezone', () => {
    expect(isWithinCallingWindow('07:00', '09:00', 'America/New_York', noonUtc)).toBe(true);
    expect(isWithinCallingWindow('09:00', '16:00', 'Asia/Karachi', noonUtc)).toBe(false);
  });

  it('supports windows that cross midnight', () => {
    expect(isWithinCallingWindow('22:00', '07:00', 'UTC', noonUtc)).toBe(false);
    expect(
      isWithinCallingWindow('22:00', '07:00', 'UTC', new Date('2026-08-09T23:30:00.000Z'))
    ).toBe(true);
  });

  it('fails closed for invalid times and timezones', () => {
    expect(isWithinCallingWindow('9:00', '17:00', 'UTC', noonUtc)).toBe(false);
    expect(isWithinCallingWindow('09:00', '17:00', 'Not/AZone', noonUtc)).toBe(false);
  });
});

