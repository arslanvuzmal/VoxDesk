import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ findFirst: vi.fn() }));
vi.mock('@/lib/database', () => ({
  prisma: { conversation: { findFirst: mocks.findFirst } },
}));

import {
  assertPersistedConversationContext,
  isSupportedDatabaseTool,
  ToolExecutionError,
} from '@/lib/voice-agent/tool-executor';

const context = {
  conversationId: 'conversation-a',
  workspaceId: 'workspace-a',
  businessId: 'business-a',
  contactId: 'contact-a',
  agentId: 'agent-a',
  agentVersionId: 'agent-version-a',
  trainingPackVersionId: 'training-pack-a',
  channel: 'PHONE' as const,
  direction: 'INBOUND' as const,
  language: 'en-US',
};

describe('persisted conversation tool context', () => {
  beforeEach(() => vi.clearAllMocks());

  it('matches every tenant and version claim against persisted state', async () => {
    mocks.findFirst.mockResolvedValue({ id: 'conversation-a' });

    await assertPersistedConversationContext(context);

    expect(mocks.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'conversation-a',
          workspaceId: 'workspace-a',
          businessId: 'business-a',
          contactId: 'contact-a',
          agentId: 'agent-a',
          agentVersionId: 'agent-version-a',
          trainingPackVersionId: 'training-pack-a',
          channel: 'PHONE',
          direction: 'INBOUND',
          languageCode: 'en-US',
        }),
      })
    );
  });

  it('fails closed when any persisted claim does not match', async () => {
    mocks.findFirst.mockResolvedValue(null);

    await expect(assertPersistedConversationContext(context)).rejects.toMatchObject({
      code: 'AUTHORIZATION',
      status: 403,
    } satisfies Partial<ToolExecutionError>);
  });

  it('allows a null contact claim to be refreshed after the same conversation links a contact', async () => {
    mocks.findFirst.mockResolvedValue({ id: 'conversation-a', contactId: 'contact-new' });

    await assertPersistedConversationContext({ ...context, contactId: null });

    const where = mocks.findFirst.mock.calls[0][0].where;
    expect(where).not.toHaveProperty('contactId');
    expect(where).toMatchObject({
      id: 'conversation-a',
      workspaceId: 'workspace-a',
      businessId: 'business-a',
    });
  });

  it('only enables database-backed actions', () => {
    expect(isSupportedDatabaseTool('create_task')).toBe(true);
    expect(isSupportedDatabaseTool('create_or_update_contact')).toBe(true);
    expect(isSupportedDatabaseTool('complete_task')).toBe(true);
    expect(isSupportedDatabaseTool('record_opt_out')).toBe(true);
    expect(isSupportedDatabaseTool('check_availability')).toBe(true);
    expect(isSupportedDatabaseTool('book_appointment')).toBe(true);
    expect(isSupportedDatabaseTool('reschedule_appointment')).toBe(true);
    expect(isSupportedDatabaseTool('cancel_appointment')).toBe(true);
    expect(isSupportedDatabaseTool('create_opportunity')).toBe(true);
    expect(isSupportedDatabaseTool('update_opportunity')).toBe(true);
  });
});
