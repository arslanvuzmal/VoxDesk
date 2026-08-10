import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  jobsFind: vi.fn(),
  jobsUpdateMany: vi.fn(),
  jobUpdate: vi.fn(),
  attemptFind: vi.fn(),
  attemptUpdate: vi.fn(),
  attemptUpdateMany: vi.fn(),
  recipientUpdate: vi.fn(),
  campaignUpdate: vi.fn(),
  readiness: vi.fn(),
}));

vi.mock('@/lib/database', () => ({
  prisma: {
    backgroundJob: {
      findMany: mocks.jobsFind,
      updateMany: mocks.jobsUpdateMany,
      update: mocks.jobUpdate,
    },
    outboundAttempt: {
      findFirst: mocks.attemptFind,
      update: mocks.attemptUpdate,
      updateMany: mocks.attemptUpdateMany,
    },
    campaignRecipient: { update: mocks.recipientUpdate },
    campaign: { update: mocks.campaignUpdate },
    $transaction: vi.fn((operations: Promise<unknown>[]) => Promise.all(operations)),
  },
}));
vi.mock('@/lib/telephony/outbound/campaign-readiness', () => ({
  getCampaignReadiness: mocks.readiness,
}));
vi.mock('@/lib/features/flags', () => ({ featureFlags: { isEnabled: vi.fn() } }));

import { claimOutboundJobs, processOutboundJob } from '@/workers/outbound-campaigns';

const job = {
  id: 'job-a',
  workspaceId: 'workspace-a',
  type: 'OUTBOUND_CALL_EXECUTE',
  resourceType: 'OUTBOUND_ATTEMPT',
  resourceId: 'attempt-a',
  status: 'PENDING',
  attempt: 0,
  maxAttempts: 3,
  availableAt: new Date('2026-08-10T10:00:00Z'),
  lockedAt: null,
  completedAt: null,
  errorCategory: null,
  correlationId: 'correlation-a',
  createdAt: new Date('2026-08-10T09:00:00Z'),
  updatedAt: new Date('2026-08-10T09:00:00Z'),
};
const claimedJob = { ...job, status: 'RUNNING', lockedAt: new Date('2026-08-10T10:01:00Z') };

describe('outbound job worker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.jobUpdate.mockResolvedValue(job);
    mocks.attemptUpdate.mockResolvedValue({ id: 'attempt-a' });
    mocks.attemptUpdateMany.mockResolvedValue({ count: 1 });
    mocks.recipientUpdate.mockResolvedValue({ id: 'recipient-a' });
    mocks.campaignUpdate.mockResolvedValue({ id: 'campaign-a' });
  });

  it('processes only jobs won by an atomic conditional claim', async () => {
    mocks.jobsFind.mockResolvedValue([job, { ...job, id: 'job-b' }]);
    mocks.jobsUpdateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
    const claimed = await claimOutboundJobs(10, new Date('2026-08-10T10:01:00Z'));
    expect(claimed.map(item => item.id)).toEqual(['job-a']);
    expect(mocks.jobsUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'job-a', status: 'PENDING', lockedAt: null }),
        data: expect.objectContaining({ status: 'RUNNING', attempt: { increment: 1 } }),
      })
    );
  });

  it('revalidates eligibility and retries when no canonical provider executor is installed', async () => {
    mocks.attemptFind.mockResolvedValue({
      id: 'attempt-a',
      workspaceId: 'workspace-a',
      campaignId: 'campaign-a',
      recipientId: 'recipient-a',
      status: 'QUEUED',
      campaign: {
        id: 'campaign-a',
        workspaceId: 'workspace-a',
        approvalStatus: 'APPROVED',
        state: 'SCHEDULED',
        startedAt: null,
      },
      recipient: { id: 'recipient-a', workspaceId: 'workspace-a', campaignId: 'campaign-a' },
    });
    mocks.readiness.mockResolvedValue({ report: { eligibleRecipientIds: ['recipient-a'] } });
    const result = await processOutboundJob(claimedJob);
    expect(result).toBe('RETRY');
    expect(mocks.jobUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'PENDING',
          errorCategory: 'PROVIDER_UNAVAILABLE',
          lockedAt: null,
        }),
      })
    );
    expect(mocks.attemptUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'PROVIDER_REQUESTING' } })
    );
    expect(mocks.attemptUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'QUEUED' } })
    );
  });

  it('marks provider acceptance only after the server-side executor confirms it', async () => {
    mocks.attemptFind.mockResolvedValue({
      id: 'attempt-a',
      workspaceId: 'workspace-a',
      campaignId: 'campaign-a',
      recipientId: 'recipient-a',
      status: 'QUEUED',
      campaign: {
        id: 'campaign-a',
        workspaceId: 'workspace-a',
        approvalStatus: 'APPROVED',
        state: 'SCHEDULED',
        startedAt: null,
      },
      recipient: { id: 'recipient-a', workspaceId: 'workspace-a', campaignId: 'campaign-a' },
    });
    mocks.readiness.mockResolvedValue({ report: { eligibleRecipientIds: ['recipient-a'] } });
    const executor = vi
      .fn()
      .mockResolvedValue({ accepted: true, providerCallControlId: 'telnyx-call-a' });
    const result = await processOutboundJob(claimedJob, executor);
    expect(result).toBe('SUCCEEDED');
    expect(executor).toHaveBeenCalledWith(expect.objectContaining({ idempotencyKey: 'attempt-a' }));
    expect(mocks.attemptUpdate).toHaveBeenCalledWith({
      where: { id: 'attempt-a' },
      data: expect.objectContaining({
        status: 'INITIATING',
        notes: 'telnyx-call-a',
      }),
    });
    expect(mocks.jobUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'COMPLETED' }) })
    );
  });
});

