import { describe, expect, it } from 'vitest';
import crypto from 'crypto';
import {
  hashPhoneNumber,
  maskPhoneNumber,
  normalizePhoneNumber,
  phoneLast4,
} from '@/lib/security/identifiers';

describe('sensitive phone identifiers', () => {
  it('normalizes common formatting to a canonical E.164 value', () => {
    expect(normalizePhoneNumber('+1 (555) 234-5678')).toBe('+15552345678');
  });

  it('rejects non-E.164 and ambiguous national numbers', () => {
    expect(() => normalizePhoneNumber('555-234-5678')).toThrow();
    expect(() => normalizePhoneNumber('+0123')).toThrow();
  });

  it('uses keyed HMAC rather than unsalted SHA-256', () => {
    const phone = '+15552345678';
    const digest = hashPhoneNumber(phone);
    const unsalted = crypto.createHash('sha256').update(phone).digest('hex');

    expect(digest).toHaveLength(64);
    expect(digest).not.toBe(unsalted);
    expect(hashPhoneNumber('+1 (555) 234-5678')).toBe(digest);
  });

  it('exposes only the last four digits for display', () => {
    expect(phoneLast4('+15552345678')).toBe('5678');
    expect(maskPhoneNumber('+15552345678')).toBe('***5678');
  });
});

