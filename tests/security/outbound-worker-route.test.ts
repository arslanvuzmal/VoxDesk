import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const processOutboundQueue = vi.fn();

vi.mock('@/workers/outbound-campaigns', () => ({
  processOutboundQueue,
}));

import { GET } from '@/app/api/internal/outbound/worker/route';

describe('outbound worker trigger', () => {
  it('rejects requests without the internal bearer secret', async () => {
    const response = await GET(
      new NextRequest('https://example.test/api/internal/outbound/worker')
    );

    expect(response.status).toBe(401);
    expect(processOutboundQueue).not.toHaveBeenCalled();
  });

  it('processes the queue only with the internal bearer secret', async () => {
    processOutboundQueue.mockResolvedValueOnce({
      processed: 1,
      succeeded: 1,
      retried: 0,
      blocked: 0,
    });

    const secret = process.env.INTERNAL_API_SECRET;
    if (!secret) throw new Error('INTERNAL_API_SECRET is required for this test');

    const response = await GET(
      new NextRequest('https://example.test/api/internal/outbound/worker', {
        headers: { authorization: `Bearer ${secret}` },
      })
    );

    expect(response.status).toBe(200);
    expect(processOutboundQueue).toHaveBeenCalledTimes(1);
    await expect(response.json()).resolves.toMatchObject({
      data: { processed: 1, succeeded: 1 },
    });
  });
});
