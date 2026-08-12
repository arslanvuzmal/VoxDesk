import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const tx = {
    appointment: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    opportunity: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    task: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    auditLog: { create: vi.fn() },
    businessProfile: { findFirst: vi.fn() },
    contact: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    conversation: { updateMany: vi.fn() },
    call: { updateMany: vi.fn() },
    conversationToolExecution: { update: vi.fn() },
  };
  return {
    tx,
    conversationFindFirst: vi.fn(),
    executionFindFirst: vi.fn(),
    executionFindMany: vi.fn(),
    executionCreate: vi.fn(),
    executionUpdate: vi.fn(),
    stateFindUnique: vi.fn(),
    auditCreate: vi.fn(),
    transaction: vi.fn(async (input: ((client: typeof tx) => unknown) | Promise<unknown>[]) =>
      Array.isArray(input) ? Promise.all(input) : input(tx)
    ),
  };
});

vi.mock('@/lib/database', () => ({
  prisma: {
    conversation: { findFirst: mocks.conversationFindFirst },
    conversationToolExecution: {
      findFirst: mocks.executionFindFirst,
      findMany: mocks.executionFindMany,
      create: mocks.executionCreate,
      update: mocks.executionUpdate,
    },
    conversationState: { findUnique: mocks.stateFindUnique },
    auditLog: { create: mocks.auditCreate },
    $transaction: mocks.transaction,
  },
}));

import { executeDatabaseTool } from '@/lib/voice-agent/tool-executor';

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

describe('authorized appointment tools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.conversationFindFirst.mockResolvedValue({
      id: 'conversation-a',
      workspaceId: 'workspace-a',
      contactId: 'contact-a',
      callId: 'call-a',
      agentId: 'agent-a',
    });
    mocks.executionFindFirst.mockResolvedValue(null);
    mocks.executionFindMany.mockResolvedValue([]);
    mocks.executionCreate.mockResolvedValue({ id: 'execution-a' });
    mocks.executionUpdate.mockResolvedValue({});
    mocks.stateFindUnique.mockResolvedValue(null);
    mocks.auditCreate.mockResolvedValue({});
    mocks.tx.businessProfile.findFirst.mockResolvedValue({ timezone: 'America/New_York' });
    mocks.tx.conversationToolExecution.update.mockResolvedValue({});
    mocks.tx.auditLog.create.mockResolvedValue({});
  });

  it('reports a persisted overlap as unavailable without creating an appointment', async () => {
    mocks.tx.appointment.findFirst.mockResolvedValue({ id: 'occupied-appointment' });

    const result = await executeDatabaseTool(
      'check_availability',
      'tool-execution-availability',
      { startTime: '2030-05-01T14:00:00.000Z', endTime: '2030-05-01T14:30:00.000Z' },
      context
    );

    expect(result).toMatchObject({ available: false, source: 'VOXDESK_DATABASE' });
    expect(mocks.tx.appointment.create).not.toHaveBeenCalled();
  });

  it('creates a confirmed appointment linked to the trusted contact and conversation', async () => {
    mocks.tx.appointment.findFirst.mockResolvedValue(null);
    mocks.tx.contact.findFirst.mockResolvedValue({ id: 'contact-a', name: 'Verified Caller' });
    mocks.tx.appointment.create.mockResolvedValue({
      id: 'appointment-a',
      status: 'CONFIRMED',
      startTime: new Date('2030-05-01T14:00:00.000Z'),
      endTime: new Date('2030-05-01T14:30:00.000Z'),
      timezone: 'America/New_York',
    });

    const result = await executeDatabaseTool(
      'book_appointment',
      'tool-execution-booking',
      {
        service: 'Consultation',
        startTime: '2030-05-01T14:00:00.000Z',
        endTime: '2030-05-01T14:30:00.000Z',
      },
      context
    );

    expect(result).toMatchObject({ appointmentId: 'appointment-a', status: 'CONFIRMED' });
    expect(mocks.tx.appointment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        workspaceId: 'workspace-a',
        contactId: 'contact-a',
        conversationId: 'conversation-a',
        callId: 'call-a',
        callerName: 'Verified Caller',
      }),
    });
    expect(mocks.transaction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ isolationLevel: 'Serializable' })
    );
  });

  it('rejects a second active appointment for the same conversation', async () => {
    mocks.tx.appointment.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'existing-appointment' });
    mocks.tx.contact.findFirst.mockResolvedValue({ id: 'contact-a', name: 'Verified Caller' });

    await expect(
      executeDatabaseTool(
        'book_appointment',
        'tool-execution-duplicate',
        {
          service: 'Consultation',
          startTime: '2030-05-01T14:00:00.000Z',
          endTime: '2030-05-01T14:30:00.000Z',
        },
        context
      )
    ).rejects.toMatchObject({ code: 'CONFLICT', status: 409 });
    expect(mocks.tx.appointment.create).not.toHaveBeenCalled();
  });

  it('creates an evidence-backed qualified opportunity for the trusted contact', async () => {
    mocks.tx.contact.findFirst.mockResolvedValue({ id: 'contact-a' });
    mocks.tx.opportunity.findUnique.mockResolvedValue(null);
    mocks.tx.opportunity.create.mockResolvedValue({
      id: 'opportunity-a',
      stage: 'QUALIFIED',
    });

    const result = await executeDatabaseTool(
      'create_opportunity',
      'tool-execution-opportunity',
      {
        title: 'Commercial consultation',
        serviceInterest: 'Advisory',
        qualificationCriteria: ['Requested an advisory consultation'],
        evidence: ['Customer explicitly asked to discuss an advisory engagement'],
        confidence: 0.8,
        recommendation: 'Arrange discovery with the service team',
      },
      context
    );

    expect(result).toMatchObject({ opportunityId: 'opportunity-a', stage: 'QUALIFIED' });
    expect(mocks.tx.opportunity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        workspaceId: 'workspace-a',
        contactId: 'contact-a',
        sourceConversationId: 'conversation-a',
        stage: 'QUALIFIED',
      }),
    });
  });

  it('completes only a pending task owned by the signed conversation', async () => {
    mocks.tx.task.findFirst.mockResolvedValue({ id: 'task-owned-by-conversation' });
    mocks.tx.task.update.mockResolvedValue({
      id: 'task-owned-by-conversation',
      status: 'COMPLETED',
    });

    const result = await executeDatabaseTool(
      'complete_task',
      'tool-execution-complete-task',
      { taskId: 'task-owned-by-conversation' },
      context
    );

    expect(result).toMatchObject({ taskId: 'task-owned-by-conversation', status: 'COMPLETED' });
    expect(mocks.tx.task.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'task-owned-by-conversation',
        workspaceId: 'workspace-a',
        sourceType: 'CONVERSATION',
        sourceId: 'conversation-a',
        status: 'PENDING',
      },
      select: { id: true },
    });
  });

  it('creates and links an encrypted contact without persisting raw identifiers', async () => {
    mocks.conversationFindFirst.mockResolvedValue({
      id: 'conversation-a',
      workspaceId: 'workspace-a',
      contactId: null,
      callId: 'call-a',
      agentId: 'agent-a',
    });
    mocks.tx.contact.findFirst.mockResolvedValue(null);
    mocks.tx.contact.create.mockImplementation(async ({ data }) => ({
      id: 'contact-new',
      ...data,
    }));
    mocks.tx.conversation.updateMany.mockResolvedValue({ count: 1 });
    mocks.tx.call.updateMany.mockResolvedValue({ count: 1 });

    const result = await executeDatabaseTool(
      'create_or_update_contact',
      'tool-execution-contact',
      { name: 'Verified Caller', phone: '+1 (555) 234-5678', email: 'Caller@Example.com' },
      { ...context, contactId: null }
    );

    expect(result).toMatchObject({ contactId: 'contact-new', status: 'CREATED' });
    const created = mocks.tx.contact.create.mock.calls[0][0].data;
    expect(created.phoneHash).toMatch(/^[a-f0-9]{64}$/);
    expect(created.phoneEncrypted).toMatch(/^enc:v1:/);
    expect(created.emailEncrypted).toMatch(/^enc:v1:/);
    expect(created.phoneMasked).toBe('***5678');
    expect(created.phoneLast4).toBe('5678');
    expect(JSON.stringify(created)).not.toContain('+15552345678');
    expect(JSON.stringify(created)).not.toContain('caller@example.com');
    expect(mocks.tx.conversation.updateMany).toHaveBeenCalledWith({
      where: { id: 'conversation-a', workspaceId: 'workspace-a', contactId: null },
      data: { contactId: 'contact-new' },
    });
  });
});
