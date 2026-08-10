import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  readiness: vi.fn(),
  campaignUpdateMany: vi.fn(),
  recipientUpdateMany: vi.fn(),
  attemptCreate: vi.fn(),
  jobCreate: vi.fn(),
  auditCreate: vi.fn(),
  campaignFind: vi.fn(),
}));

vi.mock('@/lib/auth/require-campaign', () => ({
  requireCampaignAccess: vi
    .fn()
    .mockResolvedValue({ workspaceId: 'workspace-a', userId: 'user-a' }),
}));
vi.mock('@/lib/telephony/outbound/campaign-readiness', () => ({
  getCampaignReadiness: mocks.readiness,
}));
vi.mock('@/lib/database', () => ({
  prisma: {
    $transaction: vi.fn(async (callback: (tx: unknown) => unknown) =>
      callback({
        campaign: { updateMany: mocks.campaignUpdateMany, findUniqueOrThrow: mocks.campaignFind },
        campaignRecipient: { updateMany: mocks.recipientUpdateMany },
        outboundAttempt: { create: mocks.attemptCreate },
        backgroundJob: { create: mocks.jobCreate },
        auditLog: { create: mocks.auditCreate },
      })
    ),
  },
}));

import { POST } from '@/app/api/telephony/campaigns/[id]/start/route';

describe('campaign start queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const recipient = { id: 'recipient-a', status: 'PENDING', attempts: 0 };
    mocks.readiness.mockResolvedValue({
      campaign: {
        id: 'campaign-a',
        workspaceId: 'workspace-a',
        approvalStatus: 'APPROVED',
        state: 'DRAFT',
        recipients: [recipient],
      },
      report: { eligibleRecipientIds: ['recipient-a'], validRecipients: 1 },
    });
    mocks.campaignUpdateMany.mockResolvedValue({ count: 1 });
    mocks.recipientUpdateMany.mockResolvedValue({ count: 1 });
    mocks.attemptCreate.mockResolvedValue({ id: 'campaign_attempt_recipient-a_1' });
    mocks.jobCreate.mockResolvedValue({ id: 'job-a' });
    mocks.auditCreate.mockResolvedValue({ id: 'audit-a' });
    mocks.campaignFind.mockResolvedValue({ id: 'campaign-a', state: 'SCHEDULED' });
  });

  it('persists an idempotent queued attempt and durable execution job', async () => {
    const response = await POST(new NextRequest('https://example.test/start', { method: 'POST' }), {
      params: Promise.resolve({ id: 'campaign-a' }),
    });
    expect(response.status).toBe(200);
    expect(mocks.attemptCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: 'campaign_attempt_recipient-a_1',
        status: 'QUEUED',
        attemptNumber: 1,
      }),
    });
    expect(mocks.attemptCreate.mock.calls[0][0].data).not.toHaveProperty('startedAt');
    expect(mocks.jobCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'OUTBOUND_CALL_EXECUTE',
        resourceType: 'OUTBOUND_ATTEMPT',
        resourceId: 'campaign_attempt_recipient-a_1',
        status: 'PENDING',
      }),
    });
    expect(mocks.campaignUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { state: 'SCHEDULED', startedAt: null } })
    );
  });
});

