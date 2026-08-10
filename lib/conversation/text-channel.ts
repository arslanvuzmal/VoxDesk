import 'server-only';
import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/database';
import { decideSpecialist } from '@/lib/conversation/orchestrator';

export interface TextTurnInput {
  workspaceId: string;
  businessId?: string;
  agentId?: string;
  languageCode?: string;
  contactId?: string;
  conversationId?: string;
  message: string;
}

export class TextChannelError extends Error {
  constructor(
    readonly code: 'NOT_FOUND' | 'REQUIRES_CONFIGURATION' | 'CONFLICT',
    message: string
  ) {
    super(message);
  }
}

function inferIntent(message: string): string {
  if (/book|appointment|schedule|reschedul|cancel|availability/i.test(message))
    return 'APPOINTMENT';
  if (/human|person|manager|representative/i.test(message)) return 'HUMAN_HANDOFF';
  if (/price|quote|buy|consultation/i.test(message)) return 'SALES_ENQUIRY';
  if (/support|problem|issue|status/i.test(message)) return 'CUSTOMER_SUPPORT';
  return 'GENERAL_ENQUIRY';
}

export async function processTextTurn(input: TextTurnInput) {
  const conversation = input.conversationId
    ? await prisma.conversation.findFirst({
        where: { id: input.conversationId, workspaceId: input.workspaceId, channel: 'WEB_TEXT' },
        include: { state: true },
      })
    : await createTextConversation(input);
  if (!conversation) throw new TextChannelError('NOT_FOUND', 'Conversation not found.');
  if (['COMPLETED', 'FAILED'].includes(conversation.status)) {
    throw new TextChannelError('CONFLICT', 'This conversation has already ended.');
  }

  const lastMessage = await prisma.conversationMessage.findFirst({
    where: { conversationId: conversation.id },
    orderBy: { sequence: 'desc' },
    select: { sequence: true },
  });
  const customerSequence = (lastMessage?.sequence ?? 0) + 1;
  const intent = inferIntent(input.message);
  const decision = decideSpecialist({
    intent,
    requestedOutcome: input.message,
    requestedHuman: intent === 'HUMAN_HANDOFF',
  });
  const now = new Date();
  const knowledge = await prisma.knowledgeItem.findFirst({
    where: {
      workspaceId: input.workspaceId,
      language: conversation.languageCode || undefined,
      status: 'ACTIVE',
      verifiedAt: { not: null },
      effectiveFrom: { lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      content: { contains: input.message.slice(0, 80), mode: 'insensitive' },
    },
    orderBy: { verifiedAt: 'desc' },
    select: { content: true, title: true },
  });
  const reply = decision.requiresHuman
    ? 'I can record your request for a team member to take over. I have not connected anyone yet.'
    : knowledge?.content ||
      'I do not have an approved answer for that in the business information available to me. I can record the question for the team.';

  await prisma.$transaction([
    prisma.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        speaker: 'CUSTOMER',
        type: 'TEXT',
        text: input.message,
        sequence: customerSequence,
        language: conversation.languageCode,
      },
    }),
    prisma.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        speaker: 'AGENT',
        type: 'TEXT',
        text: reply,
        sequence: customerSequence + 1,
        language: conversation.languageCode,
      },
    }),
    prisma.conversation.update({
      where: { id: conversation.id },
      data: { status: 'ACTIVE', intent, requiresReview: decision.requiresHuman },
    }),
    prisma.conversationState.upsert({
      where: { conversationId: conversation.id },
      create: {
        conversationId: conversation.id,
        currentIntent: intent,
        currentSpecialist: decision.specialist,
        requestedOutcome: input.message,
        handoffState: decision.requiresHuman
          ? ({ status: 'REQUESTED', reason: decision.reason } as Prisma.InputJsonObject)
          : undefined,
      },
      update: {
        currentIntent: intent,
        currentSpecialist: decision.specialist,
        requestedOutcome: input.message,
        handoffState: decision.requiresHuman
          ? ({ status: 'REQUESTED', reason: decision.reason } as Prisma.InputJsonObject)
          : undefined,
      },
    }),
  ]);

  return {
    conversationId: conversation.id,
    reply,
    intent,
    specialist: decision.specialist,
    requiresHuman: decision.requiresHuman,
    knowledgeGrounded: Boolean(knowledge),
  };
}

async function createTextConversation(input: TextTurnInput) {
  if (!input.businessId || !input.agentId || !input.languageCode) {
    throw new TextChannelError(
      'REQUIRES_CONFIGURATION',
      'Business, agent, and language are required.'
    );
  }
  const [business, agent, language, trainingPack, contact] = await Promise.all([
    prisma.businessProfile.findFirst({
      where: { id: input.businessId, workspaceId: input.workspaceId },
    }),
    prisma.voiceAgent.findFirst({
      where: {
        id: input.agentId,
        workspaceId: input.workspaceId,
        businessProfileId: input.businessId,
        status: 'ACTIVE',
      },
      include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } },
    }),
    prisma.languageProfile.findFirst({
      where: {
        workspaceId: input.workspaceId,
        languageCode: input.languageCode,
        status: 'VERIFIED',
        businessContentComplete: true,
        disclosureContentComplete: true,
        lastVerifiedAt: { not: null },
      },
    }),
    prisma.businessTrainingPack.findFirst({
      where: { workspaceId: input.workspaceId, agentId: input.agentId },
      orderBy: { versionNumber: 'desc' },
    }),
    input.contactId
      ? prisma.contact.findFirst({ where: { id: input.contactId, workspaceId: input.workspaceId } })
      : null,
  ]);
  const agentVersion = agent?.versions[0];
  if (!business || !agentVersion || !language || !trainingPack || (input.contactId && !contact)) {
    throw new TextChannelError(
      'REQUIRES_CONFIGURATION',
      'The requested business, agent, language, or training version is not verified.'
    );
  }
  return prisma.conversation.create({
    data: {
      workspaceId: input.workspaceId,
      businessId: input.businessId,
      contactId: contact?.id,
      channel: 'WEB_TEXT',
      direction: 'INTERACTIVE',
      status: 'CREATED',
      agentId: input.agentId,
      agentVersionId: agentVersion.id,
      trainingPackVersionId: trainingPack.id,
      languageProfileId: language.id,
      languageCode: input.languageCode,
      correlationId: crypto.randomUUID(),
    },
    include: { state: true },
  });
}
