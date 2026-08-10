import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { signConversationContext } from '@/lib/security/conversation-context';

vi.mock('@/lib/database', () => ({
  prisma: {
    businessProfile: { findFirst: vi.fn() },
    knowledgeItem: { findMany: vi.fn() },
  },
}));

import { POST } from '@/app/api/voice/tools/[toolName]/route';

const context = {
  conversationId: 'conversation-1',
  workspaceId: 'workspace-a',
  businessId: 'business-a',
  contactId: null,
  agentId: 'agent-a',
  agentVersionId: 'agent-version-a',
  trainingPackVersionId: 'training-pack-a',
  channel: 'PHONE' as const,
  direction: 'INBOUND' as const,
  language: 'en-US',
};

function request(token?: string) {
  return new NextRequest('https://example.test/api/voice/tools/book_appointment', {
    method: 'POST',
    headers: token ? { 'x-voxdesk-conversation-context': token } : undefined,
    body: JSON.stringify({ toolExecutionId: 'execution-123', parameters: {} }),
  });
}

describe('voice tool authorization', () => {
  it('rejects requests without signed context', async () => {
    const response = await POST(request(), {
      params: Promise.resolve({ toolName: 'hold_appointment_slot' }),
    });
    expect(response.status).toBe(401);
  });

  it('rejects forged context', async () => {
    const response = await POST(request('forged-token'), {
      params: Promise.resolve({ toolName: 'book_appointment' }),
    });
    expect(response.status).toBe(403);
  });

  it('never fabricates success for an unconfigured side effect', async () => {
    const response = await POST(request(signConversationContext(context)), {
      params: Promise.resolve({ toolName: 'hold_appointment_slot' }),
    });
    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'TOOL_NOT_CONFIGURED' },
    });
  });
});

