import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const mocks = vi.hoisted(() => ({
  authorize: vi.fn(),
  rateLimit: vi.fn(),
  processTurn: vi.fn(),
}));

vi.mock('@/lib/auth/require-session', () => ({ requireWorkspaceAccess: mocks.authorize }));
vi.mock('@/lib/security/workspace-rate-limit', () => ({
  enforceWorkspaceRateLimit: mocks.rateLimit,
}));
vi.mock('@/lib/conversation/text-channel', () => ({
  processTextTurn: mocks.processTurn,
  TextChannelError: class TextChannelError extends Error {
    constructor(
      readonly code: string,
      message: string
    ) {
      super(message);
    }
  },
}));
vi.mock('@/lib/config/env', () => ({
  env: { TEXT_TURNS_PER_WORKSPACE_PER_MINUTE: '60' },
}));

import { POST } from '@/app/api/conversations/text/route';

function request(body: Record<string, unknown>) {
  return new NextRequest('https://example.test/api/conversations/text', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('web text conversation authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authorize.mockResolvedValue({
      workspaceId: 'workspace-a',
      userId: 'user-a',
      role: 'OPERATOR',
    });
    mocks.rateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 60 });
    mocks.processTurn.mockResolvedValue({
      conversationId: 'conversation-a',
      reply: 'Approved answer',
      intent: 'GENERAL_ENQUIRY',
      specialist: 'GENERAL_RECEPTION',
      requiresHuman: false,
      knowledgeGrounded: true,
    });
  });

  it('requires conversation-start permission', async () => {
    mocks.authorize.mockResolvedValue({
      errorResponse: NextResponse.json({ error: 'not found' }, { status: 404 }),
    });
    const response = await POST(request({ message: 'Hello' }));
    expect(response.status).toBe(404);
    expect(mocks.authorize).toHaveBeenCalledWith(
      expect.anything(),
      undefined,
      'conversations:start'
    );
    expect(mocks.processTurn).not.toHaveBeenCalled();
  });

  it('rejects invalid or oversized turns before domain execution', async () => {
    const response = await POST(request({ message: 'x'.repeat(4001) }));
    expect(response.status).toBe(400);
    expect(mocks.processTurn).not.toHaveBeenCalled();
  });

  it('blocks turns when the workspace cost limit is exhausted', async () => {
    mocks.rateLimit.mockResolvedValue({ allowed: false, retryAfterSeconds: 19 });
    const response = await POST(request({ conversationId: 'conversation-a', message: 'Hello' }));
    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('19');
    expect(mocks.processTurn).not.toHaveBeenCalled();
  });

  it('derives workspace ownership from the authenticated membership', async () => {
    const response = await POST(
      request({
        businessId: 'business-a',
        agentId: 'agent-a',
        languageCode: 'en-US',
        message: 'What services do you provide?',
      })
    );
    expect(response.status).toBe(200);
    expect(mocks.processTurn).toHaveBeenCalledWith(
      expect.objectContaining({ workspaceId: 'workspace-a', businessId: 'business-a' })
    );
    await expect(response.json()).resolves.toMatchObject({
      data: { conversationId: 'conversation-a', knowledgeGrounded: true },
    });
  });
});
