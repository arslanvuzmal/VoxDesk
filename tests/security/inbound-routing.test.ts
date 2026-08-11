import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hashPhoneNumber } from '@/lib/security/identifiers';
import type { IdentifiedTelnyxEvent } from '@/lib/telephony/events/telnyx-inbox';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const mocks = vi.hoisted(() => ({
  callFindFirst: vi.fn(),
  callCreate: vi.fn(),
  phoneFindFirst: vi.fn(),
  contactFindFirst: vi.fn(),
  trainingPackFindFirst: vi.fn(),
  agentVersionFindFirst: vi.fn(),
  syncConversation: vi.fn(),
}));

vi.mock('@/lib/database', () => ({
  prisma: {
    call: { findFirst: mocks.callFindFirst, create: mocks.callCreate },
    phoneNumber: { findFirst: mocks.phoneFindFirst },
    contact: { findFirst: mocks.contactFindFirst },
    businessTrainingPack: { findFirst: mocks.trainingPackFindFirst },
    agentVersion: { findFirst: mocks.agentVersionFindFirst },
  },
}));
vi.mock('@/lib/conversation/persistence', () => ({
  syncConversationProjectionIfEnabled: mocks.syncConversation,
}));

import { isOutOfOrderEvent, resolveCallContext } from '@/lib/telephony/events/telnyx-routing';

const event: IdentifiedTelnyxEvent = {
  eventType: 'CALL_INITIATED',
  providerEventId: 'event-a',
  providerCallControlId: 'control-a',
  providerCallSessionId: 'session-a',
  providerCallLegId: 'leg-a',
  timestamp: new Date('2026-08-09T10:00:00.000Z'),
  rawPayload: {},
  direction: 'INBOUND',
  fromNumber: '+15552345678',
  toNumber: '+15559876543',
  callState: 'INITIATING',
};

describe('deterministic inbound number routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.callFindFirst.mockResolvedValue(null);
    mocks.contactFindFirst.mockResolvedValue({ id: 'contact-a' });
    mocks.callCreate.mockResolvedValue({ id: 'call-a' });
    mocks.syncConversation.mockResolvedValue({ synced: false, reason: 'DISABLED' });
    mocks.phoneFindFirst.mockResolvedValue({
      id: 'phone-a',
      workspaceId: 'workspace-a',
      agentId: 'agent-a',
      workspace: { id: 'workspace-a' },
      business: { id: 'business-a', workspaceId: 'workspace-a' },
      languageProfile: {
        id: 'language-a',
        workspaceId: 'workspace-a',
        languageCode: 'en-US',
        status: 'VERIFIED',
        telephonySupported: true,
        businessContentComplete: true,
        disclosureContentComplete: true,
        pronunciationConfigured: true,
        lastVerifiedAt: new Date('2026-08-01T00:00:00.000Z'),
        voiceAgentId: 'elevenlabs-agent-a',
      },
      trainingPackVersion: {
        id: 'pack-a',
        workspaceId: 'workspace-a',
        agentId: 'agent-a',
        versionNumber: 7,
      },
      agent: {
        id: 'agent-a',
        workspaceId: 'workspace-a',
        language: 'en-US',
        versions: [{ id: 'version-a', versionNumber: 3 }],
      },
    });
  });

  it('routes by the exact keyed destination hash and persists resolved entity versions', async () => {
    const context = await resolveCallContext(event);

    expect(mocks.phoneFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          provider: 'TELNYX',
          numberHash: hashPhoneNumber(event.toNumber!),
          status: 'ACTIVE',
        },
      })
    );
    expect(mocks.callCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        workspaceId: 'workspace-a',
        agentId: 'agent-a',
        agentVersionId: 'version-a',
        contactId: 'contact-a',
        language: 'en-US',
        fromNumberHash: hashPhoneNumber(event.fromNumber!),
        toNumberHash: hashPhoneNumber(event.toNumber!),
        recordingConsent: false,
        recordingConsentState: 'NOT_REQUESTED',
      }),
    });
    expect(context).toMatchObject({
      workspaceId: 'workspace-a',
      businessId: 'business-a',
      agentId: 'agent-a',
      agentVersionId: 'version-a',
      contactId: 'contact-a',
      trainingPackVersion: 7,
    });
  });

  it('fails routing closed when a linked business belongs to another workspace', async () => {
    const configured = await mocks.phoneFindFirst();
    mocks.phoneFindFirst.mockResolvedValue({
      ...configured,
      business: { id: 'business-b', workspaceId: 'workspace-b' },
    });

    await expect(resolveCallContext(event)).resolves.toBeNull();
    expect(mocks.callCreate).not.toHaveBeenCalled();
  });

  it('fails routing closed when the assigned language is not verified for telephony', async () => {
    const configured = await mocks.phoneFindFirst();
    mocks.phoneFindFirst.mockResolvedValue({
      ...configured,
      languageProfile: { ...configured.languageProfile, status: 'TESTING' },
    });

    await expect(resolveCallContext(event)).resolves.toBeNull();
    expect(mocks.callCreate).not.toHaveBeenCalled();
  });

  it('ships secure routing fields as an additive migration', () => {
    const migration = readFileSync(
      join(
        process.cwd(),
        'prisma',
        'migrations',
        '20260809213500_secure_phone_number_routing',
        'migration.sql'
      ),
      'utf8'
    );

    expect(migration).toContain('"numberEncrypted"');
    expect(migration).toContain('"numberHash"');
    expect(migration).toContain('"businessId"');
    expect(migration).not.toMatch(/DROP\s+(TABLE|COLUMN)/i);
    expect(migration).not.toMatch(/DELETE\s+FROM/i);
  });

  it('detects stale provider events without treating equal timestamps as stale', () => {
    const latest = new Date('2026-08-09T10:00:05.000Z');
    expect(isOutOfOrderEvent(new Date('2026-08-09T10:00:04.000Z'), latest)).toBe(true);
    expect(isOutOfOrderEvent(new Date('2026-08-09T10:00:05.000Z'), latest)).toBe(false);
    expect(isOutOfOrderEvent(new Date('2026-08-09T10:00:06.000Z'), latest)).toBe(false);
  });
});
