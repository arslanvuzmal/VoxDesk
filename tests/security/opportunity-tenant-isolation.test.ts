import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  requireWorkspaceAccess: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock('@/lib/auth/require-session', () => ({
  requireWorkspaceAccess: mocks.requireWorkspaceAccess,
}));
vi.mock('@/lib/database', () => ({ prisma: { opportunity: { findMany: mocks.findMany } } }));

import { GET } from '@/app/api/opportunities/route';

describe('opportunity tenant isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireWorkspaceAccess.mockResolvedValue({ workspaceId: 'workspace-a' });
    mocks.findMany.mockResolvedValue([]);
  });

  it('derives the workspace from authorization rather than query input', async () => {
    const response = await GET(
      new NextRequest('https://example.test/api/opportunities?workspaceId=workspace-b')
    );

    expect(response.status).toBe(200);
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ workspaceId: 'workspace-a' }) })
    );
  });
});

