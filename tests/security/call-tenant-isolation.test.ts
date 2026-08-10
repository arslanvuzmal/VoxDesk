import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  requireWorkspaceAccess: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
}));

vi.mock('@/lib/auth/require-session', () => ({
  requireWorkspaceAccess: mocks.requireWorkspaceAccess,
}));

vi.mock('@/lib/database', () => ({
  prisma: {
    call: {
      findMany: mocks.findMany,
      findFirst: mocks.findFirst,
    },
  },
}));

import { GET as listCalls } from '@/app/api/calls/route';
import { GET as getCall } from '@/app/api/calls/[id]/route';

describe('call tenant isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireWorkspaceAccess.mockResolvedValue({ workspaceId: 'workspace-a' });
    mocks.findMany.mockResolvedValue([]);
    mocks.findFirst.mockResolvedValue(null);
  });

  it('scopes call lists to the authorized workspace', async () => {
    const response = await listCalls(new NextRequest('https://example.test/api/calls'));

    expect(response.status).toBe(200);
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { workspaceId: 'workspace-a' } })
    );
  });

  it('scopes call details to the authorized workspace without existence leakage', async () => {
    const response = await getCall(new NextRequest('https://example.test/api/calls/call-b'), {
      params: Promise.resolve({ id: 'call-b' }),
    });

    expect(mocks.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'call-b', workspaceId: 'workspace-a' } })
    );
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'CALL_NOT_FOUND', message: 'Call record was not found.' },
    });
  });
});

