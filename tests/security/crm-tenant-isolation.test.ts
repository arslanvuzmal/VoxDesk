import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  requireWorkspaceAccess: vi.fn(),
  appointmentFindFirst: vi.fn(),
  leadFindFirst: vi.fn(),
}));

vi.mock('@/lib/auth/require-session', () => ({
  requireWorkspaceAccess: mocks.requireWorkspaceAccess,
}));

vi.mock('@/lib/database', () => ({
  prisma: {
    appointment: { findFirst: mocks.appointmentFindFirst },
    lead: { findFirst: mocks.leadFindFirst },
  },
}));

import { GET as getAppointment } from '@/app/api/appointments/[id]/route';
import { GET as getLead } from '@/app/api/leads/[id]/route';

describe('CRM tenant isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireWorkspaceAccess.mockResolvedValue({
      workspaceId: 'workspace-a',
      userId: 'user-a',
      role: 'OPERATOR',
    });
    mocks.appointmentFindFirst.mockResolvedValue(null);
    mocks.leadFindFirst.mockResolvedValue(null);
  });

  it('scopes appointment details to the authorized workspace', async () => {
    const response = await getAppointment(
      new NextRequest('https://example.test/api/appointments/appointment-b'),
      { params: Promise.resolve({ id: 'appointment-b' }) }
    );

    expect(mocks.appointmentFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'appointment-b', workspaceId: 'workspace-a' } })
    );
    expect(response.status).toBe(404);
  });

  it('scopes lead details and transcripts to the authorized workspace', async () => {
    const response = await getLead(new NextRequest('https://example.test/api/leads/lead-b'), {
      params: Promise.resolve({ id: 'lead-b' }),
    });

    expect(mocks.leadFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'lead-b', workspaceId: 'workspace-a' } })
    );
    expect(response.status).toBe(404);
  });
});

