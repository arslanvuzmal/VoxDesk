import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  callFindUnique: vi.fn(),
  agentVersionFindFirst: vi.fn(),
  trainingPackFindFirst: vi.fn(),
  languageProfileFindFirst: vi.fn(),
  conversationUpsert: vi.fn(),
  messageUpsert: vi.fn(),
  correlationCreateMany: vi.fn(),
  stateUpsert: vi.fn(),
}));

vi.mock('@/lib/database', () => ({
  prisma: {
    $transaction: mocks.transaction,
  },
}));
vi.mock('@/lib/features/flags', () => ({
  featureFlags: { isEnabled: vi.fn().mockResolvedValue(true) },
}));

import { syncConversationProjection } from '@/lib/conversation/persistence';

describe('canonical conversation projection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const tx = {
      call: { findUnique: mocks.callFindUnique },
      agentVersion: { findFirst: mocks.agentVersionFindFirst },
      businessTrainingPack: { findFirst: mocks.trainingPackFindFirst },
      languageProfile: { findFirst: mocks.languageProfileFindFirst },
      conversation: { upsert: mocks.conversationUpsert },
      conversationMessage: { upsert: mocks.messageUpsert },
      conversationProviderCorrelation: { createMany: mocks.correlationCreateMany },
      conversationState: { upsert: mocks.stateUpsert },
    };
    mocks.transaction.mockImplementation(async callback => callback(tx));
    mocks.callFindUnique.mockResolvedValue({
      id: 'call-a',
      workspaceId: 'workspace-a',
      contactId: 'contact-a',
      channel: 'PHONE',
      direction: 'INBOUND',
      status: 'COMPLETED',
      agentId: 'agent-a',
      agentVersionId: 'version-a',
      language: 'en-US',
      provider: 'ELEVENLABS',
      providerConversationId: 'el-conversation-a',
      providerCallControlId: 'telnyx-control-a',
      providerCallSessionId: 'telnyx-session-a',
      providerCallLegId: 'telnyx-leg-a',
      campaignId: null,
      outcome: null,
      startedAt: new Date('2026-08-09T10:00:00.000Z'),
      endedAt: new Date('2026-08-09T10:02:00.000Z'),
      durationSeconds: 120,
      workspace: { businessProfile: { id: 'business-a' } },
      summary: {
        intent: 'APPOINTMENT_RESCHEDULE',
        urgency: 'medium',
        sentiment: 'neutral',
        summary: 'Customer requested a different appointment time.',
      },
      transcriptSegments: [
        {
          id: 'segment-a',
          speaker: 'caller',
          text: 'Can I move my appointment?',
          startMs: 1_000,
          endMs: 2_000,
          confidence: 0.98,
          redacted: false,
        },
      ],
    });
    mocks.agentVersionFindFirst.mockResolvedValue({ id: 'version-a' });
    mocks.trainingPackFindFirst.mockResolvedValue({ id: 'pack-version-a' });
    mocks.languageProfileFindFirst.mockResolvedValue({ id: 'language-a' });
    mocks.conversationUpsert.mockResolvedValue({ id: 'conversation-a' });
    mocks.messageUpsert.mockResolvedValue({ id: 'message-a' });
    mocks.correlationCreateMany.mockResolvedValue({ count: 4 });
    mocks.stateUpsert.mockResolvedValue({ id: 'state-a' });
  });

  it('projects trusted entity mappings and provider identifiers into one conversation', async () => {
    await expect(syncConversationProjection('call-a')).resolves.toEqual({
      synced: true,
      conversationId: 'conversation-a',
    });

    expect(mocks.agentVersionFindFirst).toHaveBeenCalledWith({
      where: { id: 'version-a', agentId: 'agent-a' },
      select: { id: true },
    });
    expect(mocks.conversationUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { callId: 'call-a' },
        create: expect.objectContaining({
          workspaceId: 'workspace-a',
          businessId: 'business-a',
          agentId: 'agent-a',
          agentVersionId: 'version-a',
          trainingPackVersionId: 'pack-version-a',
          languageProfileId: 'language-a',
          outcome: null,
          completenessStatus: 'COMPLETE',
        }),
      })
    );
    expect(mocks.messageUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          conversationId_sequence: { conversationId: 'conversation-a', sequence: 1 },
        },
      })
    );
    expect(mocks.correlationCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            provider: 'TELNYX',
            identifierType: 'TELNYX_CALL_CONTROL_ID',
          }),
          expect.objectContaining({
            provider: 'ELEVENLABS',
            identifierType: 'ELEVENLABS_CONVERSATION_ID',
          }),
        ]),
        skipDuplicates: true,
      })
    );
  });

  it('does not invent a business mapping when configuration is absent', async () => {
    const call = await mocks.callFindUnique();
    mocks.callFindUnique.mockResolvedValue({
      ...call,
      workspace: { businessProfile: null },
    });

    await expect(syncConversationProjection('call-a')).resolves.toEqual({
      synced: false,
      reason: 'BUSINESS_NOT_CONFIGURED',
    });
    expect(mocks.conversationUpsert).not.toHaveBeenCalled();
  });
});

