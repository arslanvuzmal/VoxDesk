import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const mocks = vi.hoisted(() => ({
  requireCampaignAccess: vi.fn(),
  campaignFindFirst: vi.fn(),
  campaignFindUnique: vi.fn(),
  campaignUpdate: vi.fn(),
}));

vi.mock('@/lib/auth/require-campaign', () => ({
  requireCampaignAccess: mocks.requireCampaignAccess,
}));
vi.mock('@/lib/database', () => ({
  prisma: {
    campaign: {
      findFirst: mocks.campaignFindFirst,
      findUnique: mocks.campaignFindUnique,
      update: mocks.campaignUpdate,
    },
  },
}));

import { POST as approve } from '@/app/api/telephony/campaigns/[id]/approve/route';
import { POST as cancel } from '@/app/api/telephony/campaigns/[id]/cancel/route';
import { POST as dryRun } from '@/app/api/telephony/campaigns/[id]/dry-run/route';
import { POST as pause } from '@/app/api/telephony/campaigns/[id]/pause/route';
import { POST as resume } from '@/app/api/telephony/campaigns/[id]/resume/route';
import { POST as start } from '@/app/api/telephony/campaigns/[id]/start/route';

const actions = [
  ['approve', approve, 'campaigns:approve'],
  ['cancel', cancel, 'campaigns:execute'],
  ['dry run', dryRun, 'campaigns:manage'],
  ['pause', pause, 'campaigns:execute'],
  ['resume', resume, 'campaigns:execute'],
  ['start', start, 'campaigns:execute'],
] as const;

describe('campaign action authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireCampaignAccess.mockResolvedValue({
      errorResponse: NextResponse.json({ error: 'not found' }, { status: 404 }),
    });
  });

  for (const [name, handler, permission] of actions) {
    it(`requires ${permission} before ${name}`, async () => {
      const request = new NextRequest(
        `https://example.test/api/telephony/campaigns/campaign-b/${name}`,
        { method: 'POST' }
      );
      const response = await handler(request, {
        params: Promise.resolve({ id: 'campaign-b' }),
      });

      expect(response.status).toBe(404);
      expect(mocks.requireCampaignAccess).toHaveBeenCalledWith(
        expect.anything(),
        'campaign-b',
        permission
      );
      expect(mocks.campaignFindFirst).not.toHaveBeenCalled();
      expect(mocks.campaignFindUnique).not.toHaveBeenCalled();
      expect(mocks.campaignUpdate).not.toHaveBeenCalled();
    });
  }
});

