import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const mocks = vi.hoisted(() => ({
  requireWorkspaceAccess: vi.fn(),
  isEnabled: vi.fn(),
  contactFindFirst: vi.fn(),
  campaignFindFirst: vi.fn(),
}));

vi.mock('@/lib/auth/require-session', () => ({
  requireWorkspaceAccess: mocks.requireWorkspaceAccess,
}));
vi.mock('@/lib/features/flags', () => ({
  featureFlags: { isEnabled: mocks.isEnabled },
}));
vi.mock('@/lib/database', () => ({
  prisma: {
    contact: { findFirst: mocks.contactFindFirst },
    campaign: { findFirst: mocks.campaignFindFirst },
  },
}));

import { POST } from '@/app/api/telephony/outbound/route';

function request(body: Record<string, unknown>) {
  return new NextRequest('https://example.test/api/telephony/outbound', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('outbound authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isEnabled.mockResolvedValue(true);
    mocks.requireWorkspaceAccess.mockResolvedValue({
      workspaceId: 'workspace-a',
      userId: 'user-a',
      role: 'OPERATOR',
    });
    mocks.contactFindFirst.mockResolvedValue({ id: 'contact-a', phoneEncrypted: 'ciphertext' });
  });

  it('requires the outbound execution permission', async () => {
    mocks.requireWorkspaceAccess.mockResolvedValue({
      errorResponse: NextResponse.json({ error: 'not found' }, { status: 404 }),
    });
    const response = await POST(
      request({ contactId: 'contact-a', workflowType: 'REQUESTED_CALLBACK' })
    );
    expect(response.status).toBe(404);
    expect(mocks.requireWorkspaceAccess).toHaveBeenCalledWith(
      expect.anything(),
      undefined,
      'outbound:execute'
    );
  });

  it('ignores browser-supplied arbitrary dial numbers and initiates no call', async () => {
    const response = await POST(
      request({
        contactId: 'contact-a',
        workflowType: 'REQUESTED_CALLBACK',
        toNumber: '+15559999999',
        fromNumber: '+15558888888',
        workspaceId: 'workspace-b',
      })
    );

    expect(mocks.contactFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'contact-a', workspaceId: 'workspace-a' } })
    );
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'CALLER_ID_REQUIRES_CONFIGURATION' },
    });
  });
});

