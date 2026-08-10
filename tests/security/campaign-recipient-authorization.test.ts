import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const mocks = vi.hoisted(() => ({
  requireCampaignAccess: vi.fn(),
  campaignFindFirst: vi.fn(),
  campaignUpdate: vi.fn(),
  contactFindMany: vi.fn(),
  recipientFindMany: vi.fn(),
  recipientCreateMany: vi.fn(),
  recipientCount: vi.fn(),
}));

vi.mock('@/lib/auth/require-campaign', () => ({
  requireCampaignAccess: mocks.requireCampaignAccess,
}));
vi.mock('@/lib/database', () => ({
  prisma: {
    $transaction: vi.fn((operations: Promise<unknown>[]) => Promise.all(operations)),
    campaign: { findFirst: mocks.campaignFindFirst, update: mocks.campaignUpdate },
    contact: { findMany: mocks.contactFindMany },
    campaignRecipient: {
      findMany: mocks.recipientFindMany,
      createMany: mocks.recipientCreateMany,
      count: mocks.recipientCount,
    },
  },
}));

import { POST } from '@/app/api/telephony/campaigns/[id]/recipients/route';

function request(body: unknown) {
  return new NextRequest('https://example.test/api/telephony/campaigns/campaign-a/recipients', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('campaign recipient authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireCampaignAccess.mockResolvedValue({
      workspaceId: 'workspace-a',
      userId: 'user-a',
      role: 'OPERATOR',
    });
    mocks.campaignFindFirst.mockResolvedValue({ id: 'campaign-a', state: 'DRAFT' });
    mocks.recipientFindMany.mockResolvedValue([]);
    mocks.recipientCreateMany.mockResolvedValue({ count: 1 });
    mocks.campaignUpdate.mockResolvedValue({ id: 'campaign-a' });
    mocks.recipientCount.mockResolvedValue(1);
  });

  it('stops before data access when campaign authorization is denied', async () => {
    mocks.requireCampaignAccess.mockResolvedValue({
      errorResponse: NextResponse.json({ error: 'not found' }, { status: 404 }),
    });

    const response = await POST(
      request({ recipients: [{ contactId: 'contact-b', countryCode: 'US' }] }),
      { params: Promise.resolve({ id: 'campaign-a' }) }
    );

    expect(response.status).toBe(404);
    expect(mocks.campaignFindFirst).not.toHaveBeenCalled();
    expect(mocks.contactFindMany).not.toHaveBeenCalled();
  });

  it('rejects arbitrary browser-supplied phone recipient records', async () => {
    const response = await POST(
      request({
        recipients: [
          {
            recipientName: 'Injected recipient',
            recipientPhone: '+15559999999',
            countryCode: 'US',
          },
        ],
      }),
      { params: Promise.resolve({ id: 'campaign-a' }) }
    );

    expect(response.status).toBe(400);
    expect(mocks.contactFindMany).not.toHaveBeenCalled();
    expect(mocks.recipientCreateMany).not.toHaveBeenCalled();
  });

  it('copies encrypted identifiers only from a workspace-owned contact', async () => {
    mocks.contactFindMany.mockResolvedValue([
      {
        id: 'contact-a',
        name: 'Authorized contact',
        phoneEncrypted: 'enc:v1:phone',
        phoneHash: 'hmac-phone',
        emailEncrypted: 'enc:v1:email',
      },
    ]);

    const response = await POST(
      request({ recipients: [{ contactId: 'contact-a', countryCode: 'GB' }] }),
      { params: Promise.resolve({ id: 'campaign-a' }) }
    );

    expect(response.status).toBe(200);
    expect(mocks.contactFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['contact-a'] }, workspaceId: 'workspace-a' },
      })
    );
    expect(mocks.recipientCreateMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          workspaceId: 'workspace-a',
          campaignId: 'campaign-a',
          contactId: 'contact-a',
          recipientPhoneEncrypted: 'enc:v1:phone',
          recipientPhoneHash: 'hmac-phone',
          countryCode: 'GB',
        }),
      ],
    });
  });

  it('does not reveal whether a missing contact belongs to another workspace', async () => {
    mocks.contactFindMany.mockResolvedValue([]);

    const response = await POST(
      request({ recipients: [{ contactId: 'contact-b', countryCode: 'US' }] }),
      { params: Promise.resolve({ id: 'campaign-a' }) }
    );

    expect(response.status).toBe(404);
    expect(mocks.recipientCreateMany).not.toHaveBeenCalled();
  });
});
