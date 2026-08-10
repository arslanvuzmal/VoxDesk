import { describe, expect, it } from 'vitest';
import { mapCallChannel, mapCallDirection, mapCallStatus } from '@/lib/conversation/persistence';

describe('conversation projection mappings', () => {
  it('keeps telephone and website voice channels distinct', () => {
    expect(mapCallChannel('PHONE')).toBe('PHONE');
    expect(mapCallChannel('SIP')).toBe('PHONE');
    expect(mapCallChannel('WEB')).toBe('WEB_VOICE');
  });

  it('preserves call direction', () => {
    expect(mapCallDirection('INBOUND')).toBe('INBOUND');
    expect(mapCallDirection('OUTBOUND')).toBe('OUTBOUND');
  });

  it('maps terminal unsuccessful telephone states without inventing a successful outcome', () => {
    expect(mapCallStatus('BUSY')).toBe('COMPLETED');
    expect(mapCallStatus('NO_ANSWER')).toBe('COMPLETED');
    expect(mapCallStatus('FAILED')).toBe('FAILED');
    expect(mapCallStatus('TRANSFERRED')).toBe('HUMAN_HANDOFF');
  });
});

