import { describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const mocks = vi.hoisted(() => ({
  requireCampaignAccess: vi.fn(),
  findFirst: vi.fn(),
}));

vi.mock('@/lib/auth/require-campaign', () => ({
  requireCampaignAccess: mocks.requireCampaignAccess,
}));
vi.mock('@/lib/database', () => ({
  prisma: {
    campaign: {
      findFirst: mocks.findFirst,
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { GET } from '@/app/api/telephony/campaigns/[id]/route';

describe('campaign tenant isolation', () => {
  it('does not query campaign detail after authorization is denied', async () => {
    mocks.requireCampaignAccess.mockResolvedValue({
      errorResponse: NextResponse.json({ error: 'not found' }, { status: 404 }),
    });
    const response = await GET(
      new NextRequest('https://example.test/api/telephony/campaigns/campaign-b'),
      { params: Promise.resolve({ id: 'campaign-b' }) }
    );
    expect(response.status).toBe(404);
    expect(mocks.findFirst).not.toHaveBeenCalled();
  });

  it('scopes campaign detail to the authorized workspace', async () => {
    mocks.requireCampaignAccess.mockResolvedValue({
      workspaceId: 'workspace-a',
      userId: 'user-a',
      role: 'VIEWER',
    });
    mocks.findFirst.mockResolvedValue(null);
    await GET(new NextRequest('https://example.test/api/telephony/campaigns/campaign-b'), {
      params: Promise.resolve({ id: 'campaign-b' }),
    });
    expect(mocks.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'campaign-b', workspaceId: 'workspace-a' } })
    );
  });
});

