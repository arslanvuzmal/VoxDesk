import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  verify: vi.fn(),
  sign: vi.fn(),
  execute: vi.fn(),
}));

vi.mock('@/lib/security/conversation-context', () => ({
  verifyConversationContext: mocks.verify,
  signConversationContext: mocks.sign,
}));
vi.mock('@/lib/voice-agent/tool-executor', () => ({
  isSupportedDatabaseTool: () => true,
  executeDatabaseTool: mocks.execute,
  ToolExecutionError: class ToolExecutionError extends Error {},
}));
vi.mock('@/lib/database', () => ({ prisma: {} }));

import { POST } from '@/app/api/voice/tools/[toolName]/route';

const context = {
  conversationId: 'conversation-a',
  workspaceId: 'workspace-a',
  businessId: 'business-a',
  contactId: null,
  agentId: 'agent-a',
  agentVersionId: 'version-a',
  trainingPackVersionId: 'pack-a',
  channel: 'PHONE',
  direction: 'INBOUND',
  language: 'en-US',
};

describe('contact context refresh', () => {
  it('returns a newly signed context after the server links a contact', async () => {
    mocks.verify.mockReturnValue(context);
    mocks.execute.mockResolvedValue({
      contactId: 'contact-new',
      status: 'CREATED',
      contextRefreshRequired: true,
    });
    mocks.sign.mockReturnValue('refreshed-signed-context');

    const response = await POST(
      new NextRequest('https://example.test/api/voice/tools/create_or_update_contact', {
        method: 'POST',
        headers: { 'x-voxdesk-conversation-context': 'initial-signed-context' },
        body: JSON.stringify({
          toolExecutionId: 'contact-execution',
          parameters: { name: 'Verified Caller' },
        }),
      }),
      { params: Promise.resolve({ toolName: 'create_or_update_contact' }) }
    );

    expect(response.status).toBe(200);
    expect(mocks.sign).toHaveBeenCalledWith({ ...context, contactId: 'contact-new' });
    await expect(response.json()).resolves.toMatchObject({
      data: { contactId: 'contact-new', conversationContextToken: 'refreshed-signed-context' },
    });
  });
});

