import { describe, expect, it } from 'vitest';
import { evaluateSuggestedAction } from '@/lib/conversation/action-policy';
import { getOrganizationProfile } from '@/lib/organization/registry';

const profile = getOrganizationProfile('LEGAL');

function context(overrides: Partial<Parameters<typeof evaluateSuggestedAction>[0]> = {}) {
  return {
    suggestedAction: 'CREATE_LEAD' as const,
    state: 'ACTIVE',
    scenario: 'QUALIFICATION',
    accumulatedFields: { fullName: 'Avery Carter', phone: '+15551234567' },
    userMessage: 'I need help.',
    profile,
    ...overrides,
  };
}

describe('business action policy', () => {
  it('blocks lead creation when sensitive fields are present', () => {
    const decision = evaluateSuggestedAction(
      context({ accumulatedFields: { fullName: 'Avery Carter', ssn: 'redacted' } })
    );

    expect(decision.execute).toBe(false);
    expect('reason' in decision ? decision.reason : '').toContain('Sensitive fields');
  });

  it('blocks expired appointment confirmations', () => {
    const decision = evaluateSuggestedAction(
      context({
        suggestedAction: 'RESERVE_APPOINTMENT',
        userMessage: 'Yes, book that.',
        pendingConfirmation: {
          id: 'pending_test',
          actionType: 'RESERVE_APPOINTMENT',
          offeredAt: Date.now() - 700_000,
          expiresAt: Date.now() - 1,
          payload: {
            slotId: 'slot_test',
            startTime: new Date(Date.now() + 86_400_000).toISOString(),
            endTime: new Date(Date.now() + 90_000_000).toISOString(),
            timezone: 'America/New_York',
            serviceId: 'consultation',
            formattedDate: 'tomorrow',
          },
        },
      })
    );

    expect(decision.execute).toBe(false);
    expect('reason' in decision ? decision.reason : '').toContain('expired');
  });

  it('keeps routine conversations from creating sales leads', () => {
    const decision = evaluateSuggestedAction(
      context({ scenario: 'ROUTINE', suggestedAction: 'CREATE_LEAD' })
    );

    expect(decision.execute).toBe(false);
  });
});
