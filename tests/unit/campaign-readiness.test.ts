import { describe, expect, it } from 'vitest';
import { evaluateCampaignRecipients } from '@/lib/telephony/outbound/campaign-readiness';

const now = new Date('2026-08-10T15:00:00.000Z');

function recipient(overrides: Record<string, unknown> = {}) {
  return {
    id: 'recipient-1',
    contactId: 'contact-1',
    recipientPhoneEncrypted: 'enc:v1:phone',
    recipientPhoneHash: 'phone-hash',
    countryCode: 'US',
    suppressedAt: null,
    optOutRequested: false,
    attempts: 0,
    consentGranted: true,
    doNotCall: false,
    timeZone: 'UTC',
    activelySuppressed: false,
    ...overrides,
  };
}

describe('campaign readiness', () => {
  it('returns only recipients that pass every outbound gate', () => {
    const report = evaluateCampaignRecipients({
      recipients: [recipient(), recipient({ id: 'blocked', consentGranted: false })],
      callingWindowStart: '14:00',
      callingWindowEnd: '16:00',
      maxAttempts: 2,
      concurrencyLimit: 3,
      supportedCountries: new Set(['US']),
      now,
    });
    expect(report.validRecipients).toBe(1);
    expect(report.eligibleRecipientIds).toEqual(['recipient-1']);
    expect(report.missingConsent).toBe(1);
    expect(report.configuredConcurrency).toBe(3);
    expect(report.estimatedProviderCost).toBeNull();
  });

  it('reports every failed control without inventing eligibility', () => {
    const report = evaluateCampaignRecipients({
      recipients: [
        recipient({
          recipientPhoneEncrypted: null,
          recipientPhoneHash: null,
          countryCode: 'PK',
          optOutRequested: true,
          attempts: 2,
          timeZone: null,
        }),
      ],
      callingWindowStart: '09:00',
      callingWindowEnd: '17:00',
      maxAttempts: 2,
      concurrencyLimit: 1,
      supportedCountries: new Set(['US']),
      now,
    });
    expect(report).toMatchObject({
      validRecipients: 0,
      invalidNumbers: 1,
      suppressed: 1,
      outsideCallingWindow: 1,
      attemptLimitReached: 1,
      unsupportedCountry: 1,
    });
  });
});

