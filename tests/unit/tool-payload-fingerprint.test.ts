import { describe, expect, it } from 'vitest';
import { payloadFingerprint } from '@/lib/voice-agent/tool-executor';

describe('tool payload idempotency fingerprint', () => {
  it('is stable when object keys are reordered', () => {
    expect(payloadFingerprint({ contact: { name: 'Avery', phone: '+1' }, mode: 'CALLBACK' })).toBe(
      payloadFingerprint({ mode: 'CALLBACK', contact: { phone: '+1', name: 'Avery' } })
    );
  });

  it('changes when a consequential value changes', () => {
    expect(payloadFingerprint({ appointmentId: 'apt_1', status: 'CONFIRMED' })).not.toBe(
      payloadFingerprint({ appointmentId: 'apt_1', status: 'CANCELLED' })
    );
  });

  it('does not expose the raw payload', () => {
    const fingerprint = payloadFingerprint({ email: 'customer@example.com' });
    expect(fingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(fingerprint).not.toContain('customer@example.com');
  });
});
