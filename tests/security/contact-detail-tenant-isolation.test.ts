import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  contactFindFirst: vi.fn(),
  taskFindMany: vi.fn(),
  followUpFindMany: vi.fn(),
  handoffFindMany: vi.fn(),
}));

vi.mock('@/lib/auth/dashboard-context', () => ({
  requireDashboardContext: vi.fn().mockResolvedValue({ workspaceId: 'workspace-a' }),
}));
vi.mock('@/lib/database', () => ({
  prisma: {
    contact: { findFirst: mocks.contactFindFirst },
    task: { findMany: mocks.taskFindMany },
    followUp: { findMany: mocks.followUpFindMany },
    handoff: { findMany: mocks.handoffFindMany },
  },
}));
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

import ContactDetailPage from '@/app/(dashboard)/dashboard/contacts/[id]/page';

describe('contact detail tenant isolation', () => {
  it('queries the contact by both route id and authenticated workspace', async () => {
    mocks.contactFindFirst.mockResolvedValue(null);
    await expect(
      ContactDetailPage({ params: Promise.resolve({ id: 'contact-b' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(mocks.contactFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'contact-b', workspaceId: 'workspace-a' } })
    );
    expect(mocks.taskFindMany).not.toHaveBeenCalled();
  });
});
