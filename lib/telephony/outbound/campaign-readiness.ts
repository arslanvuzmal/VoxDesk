import { isWithinCallingWindow } from '@/lib/telephony/outbound/calling-window';
import { prisma } from '@/lib/database';

export type CampaignReadinessRecipient = {
  id: string;
  contactId: string | null;
  recipientPhoneEncrypted: string | null;
  recipientPhoneHash: string | null;
  countryCode: string;
  suppressedAt: Date | null;
  optOutRequested: boolean;
  attempts: number;
  consentGranted: boolean;
  doNotCall: boolean;
  timeZone: string | null;
  activelySuppressed: boolean;
};

export type CampaignReadinessReport = {
  evaluatedAt: string;
  totalRecipients: number;
  validRecipients: number;
  invalidNumbers: number;
  missingConsent: number;
  suppressed: number;
  outsideCallingWindow: number;
  attemptLimitReached: number;
  unsupportedCountry: number;
  configuredConcurrency: number;
  estimatedProviderCost: null;
  eligibleRecipientIds: string[];
};

export function evaluateCampaignRecipients(input: {
  recipients: CampaignReadinessRecipient[];
  callingWindowStart: string | null;
  callingWindowEnd: string | null;
  maxAttempts: number;
  concurrencyLimit: number;
  supportedCountries: ReadonlySet<string>;
  now?: Date;
}): CampaignReadinessReport {
  const now = input.now ?? new Date();
  const eligibleRecipientIds: string[] = [];
  let invalidNumbers = 0;
  let missingConsent = 0;
  let suppressed = 0;
  let outsideCallingWindow = 0;
  let attemptLimitReached = 0;
  let unsupportedCountry = 0;

  for (const recipient of input.recipients) {
    let eligible = true;
    if (!recipient.recipientPhoneEncrypted || !recipient.recipientPhoneHash) {
      invalidNumbers += 1;
      eligible = false;
    }
    if (!recipient.contactId || !recipient.consentGranted) {
      missingConsent += 1;
      eligible = false;
    }
    if (
      recipient.suppressedAt ||
      recipient.optOutRequested ||
      recipient.doNotCall ||
      recipient.activelySuppressed
    ) {
      suppressed += 1;
      eligible = false;
    }
    if (recipient.attempts >= input.maxAttempts) {
      attemptLimitReached += 1;
      eligible = false;
    }
    if (!input.supportedCountries.has(recipient.countryCode.toUpperCase())) {
      unsupportedCountry += 1;
      eligible = false;
    }
    if (
      !input.callingWindowStart ||
      !input.callingWindowEnd ||
      !recipient.timeZone ||
      !isWithinCallingWindow(
        input.callingWindowStart,
        input.callingWindowEnd,
        recipient.timeZone,
        now
      )
    ) {
      outsideCallingWindow += 1;
      eligible = false;
    }
    if (eligible) eligibleRecipientIds.push(recipient.id);
  }

  return {
    evaluatedAt: now.toISOString(),
    totalRecipients: input.recipients.length,
    validRecipients: eligibleRecipientIds.length,
    invalidNumbers,
    missingConsent,
    suppressed,
    outsideCallingWindow,
    attemptLimitReached,
    unsupportedCountry,
    configuredConcurrency: input.concurrencyLimit,
    estimatedProviderCost: null,
    eligibleRecipientIds,
  };
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string') ? value : [];
}

export async function getCampaignReadiness(
  campaignId: string,
  workspaceId: string,
  now = new Date()
) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, workspaceId },
    include: { recipients: true },
  });
  if (!campaign) return null;

  const contactIds = campaign.recipients
    .map(recipient => recipient.contactId)
    .filter((id): id is string => Boolean(id));
  const phoneHashes = campaign.recipients
    .map(recipient => recipient.recipientPhoneHash)
    .filter((hash): hash is string => Boolean(hash));
  const [consents, preferences, suppressions] = await Promise.all([
    prisma.consentRecord.findMany({
      where: {
        workspaceId,
        contactId: { in: contactIds },
        consentType: 'OUTBOUND_CALL',
        consentStatus: 'GRANTED',
        revokedAt: null,
      },
      select: { contactId: true },
    }),
    prisma.communicationPreference.findMany({
      where: { workspaceId, contactId: { in: contactIds } },
      select: { contactId: true, doNotCall: true, timeZone: true },
    }),
    prisma.suppressionEntry.findMany({
      where: {
        workspaceId,
        phoneHash: { in: phoneHashes },
        OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
      },
      select: { phoneHash: true },
    }),
  ]);
  const consented = new Set(consents.map(consent => consent.contactId).filter(Boolean));
  const preferenceByContact = new Map(
    preferences.map(preference => [preference.contactId, preference])
  );
  const suppressedHashes = new Set(suppressions.map(entry => entry.phoneHash));

  return {
    campaign,
    report: evaluateCampaignRecipients({
      recipients: campaign.recipients.map(recipient => {
        const preference = recipient.contactId
          ? preferenceByContact.get(recipient.contactId)
          : undefined;
        return {
          ...recipient,
          consentGranted: Boolean(recipient.contactId && consented.has(recipient.contactId)),
          doNotCall: preference?.doNotCall ?? false,
          timeZone: preference?.timeZone ?? null,
          activelySuppressed: Boolean(
            recipient.recipientPhoneHash && suppressedHashes.has(recipient.recipientPhoneHash)
          ),
        };
      }),
      callingWindowStart: campaign.callingWindowStart,
      callingWindowEnd: campaign.callingWindowEnd,
      maxAttempts: campaign.maxAttempts,
      concurrencyLimit: campaign.concurrencyLimit,
      supportedCountries: new Set(stringArray(campaign.supportedCountries)),
      now,
    }),
  };
}

