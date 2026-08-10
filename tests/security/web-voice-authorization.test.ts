import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const mocks = vi.hoisted(() => ({
  requireWorkspaceAccess: vi.fn(),
  business: vi.fn(),
  agent: vi.fn(),
  language: vi.fn(),
  trainingPack: vi.fn(),
  contact: vi.fn(),
  createConversation: vi.fn(),
  updateConversation: vi.fn(),
  signContext: vi.fn(),
  rateLimit: vi.fn(),
}));

vi.mock('@/lib/auth/require-session', () => ({
  requireWorkspaceAccess: mocks.requireWorkspaceAccess,
}));
vi.mock('@/lib/config/env', () => ({
  env: { ELEVENLABS_API_KEY: 'test-key', VOICE_STARTS_PER_WORKSPACE_PER_MINUTE: '20' },
}));
vi.mock('@/lib/security/workspace-rate-limit', () => ({
  enforceWorkspaceRateLimit: mocks.rateLimit,
}));
vi.mock('@/lib/security/conversation-context', () => ({
  signConversationContext: mocks.signContext,
}));
vi.mock('@/lib/database', () => ({
  prisma: {
    businessProfile: { findFirst: mocks.business },
    voiceAgent: { findFirst: mocks.agent },
    languageProfile: { findFirst: mocks.language },
    businessTrainingPack: { findFirst: mocks.trainingPack },
    contact: { findFirst: mocks.contact },
    conversation: { create: mocks.createConversation, update: mocks.updateConversation },
  },
}));

import { POST } from '@/app/api/voice/conversation/start/route';

function request(body: Record<string, unknown>) {
  return new NextRequest('https://example.test/api/voice/conversation/start', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('authenticated website voice bootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    mocks.requireWorkspaceAccess.mockResolvedValue({
      workspaceId: 'workspace-a',
      userId: 'user-a',
      role: 'OPERATOR',
    });
    mocks.business.mockResolvedValue({ id: 'business-a' });
    mocks.agent.mockResolvedValue({
      id: 'agent-a',
      voiceProvider: 'ELEVENLABS',
      versions: [{ id: 'version-a' }],
    });
    mocks.language.mockResolvedValue({
      id: 'language-a',
      voiceAgentId: 'provider-agent-a',
    });
    mocks.trainingPack.mockResolvedValue({ id: 'pack-a' });
    mocks.createConversation.mockResolvedValue({ id: 'conversation-a' });
    mocks.updateConversation.mockResolvedValue({ id: 'conversation-a' });
    mocks.signContext.mockReturnValue('signed-context');
    mocks.rateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 60 });
  });

  it('requires explicit conversation-start permission', async () => {
    mocks.requireWorkspaceAccess.mockResolvedValue({
      errorResponse: NextResponse.json({ error: 'not found' }, { status: 404 }),
    });
    const response = await POST(
      request({ businessId: 'business-a', agentId: 'agent-a', languageCode: 'en-US' })
    );
    expect(response.status).toBe(404);
    expect(mocks.requireWorkspaceAccess).toHaveBeenCalledWith(
      expect.anything(),
      undefined,
      'conversations:start'
    );
  });

  it('fails closed when the language is not verified', async () => {
    mocks.language.mockResolvedValue(null);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = await POST(
      request({ businessId: 'business-a', agentId: 'agent-a', languageCode: 'ur-PK' })
    );
    expect(response.status).toBe(409);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mocks.createConversation).not.toHaveBeenCalled();
  });

  it('blocks provider token creation when the workspace limit is exhausted', async () => {
    mocks.rateLimit.mockResolvedValue({ allowed: false, retryAfterSeconds: 41 });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = await POST(
      request({ businessId: 'business-a', agentId: 'agent-a', languageCode: 'en-US' })
    );
    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('41');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('persists the canonical conversation before returning a signed provider URL', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ signed_url: 'wss://signed' }) })
    );
    const response = await POST(
      request({ businessId: 'business-a', agentId: 'agent-a', languageCode: 'en-US' })
    );
    expect(response.status).toBe(200);
    expect(mocks.business).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'business-a', workspaceId: 'workspace-a' } })
    );
    expect(mocks.language).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ workspaceId: 'workspace-a', status: 'VERIFIED' }),
      })
    );
    expect(mocks.createConversation).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ workspaceId: 'workspace-a', channel: 'WEB_VOICE' }),
      })
    );
    await expect(response.json()).resolves.toMatchObject({
      data: { conversationId: 'conversation-a', conversationContext: 'signed-context' },
    });
  });
});

