import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/database';

export const SpecialistSchema = z.enum([
  'GENERAL_RECEPTION',
  'SCHEDULING',
  'SALES_QUALIFICATION',
  'CUSTOMER_SUPPORT',
  'ACCOUNT_SERVICE',
  'DOCUMENT_INTAKE',
  'COMPLAINT_RESOLUTION',
  'ESCALATION',
]);
export type Specialist = z.infer<typeof SpecialistSchema>;

export const OrchestrationInputSchema = z.object({
  intent: z.string().trim().min(1).max(100),
  requestedOutcome: z.string().trim().max(300).nullable().default(null),
  risk: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('LOW'),
  requestedHuman: z.boolean().default(false),
  collectedFields: z.record(z.unknown()).default({}),
  riskFlags: z.array(z.string().max(100)).max(20).default([]),
  complianceFlags: z.array(z.string().max(100)).max(20).default([]),
  summary: z.string().trim().max(2000).nullable().default(null),
});

export interface OrchestrationDecision {
  specialist: Specialist;
  requiresHuman: boolean;
  reason: string;
}

const INTENT_ROUTES: ReadonlyArray<{ pattern: RegExp; specialist: Specialist }> = [
  {
    pattern: /book|appointment|schedule|reschedul|cancel appointment|availability/i,
    specialist: 'SCHEDULING',
  },
  { pattern: /buy|quote|pricing|sales|qualif|consultation/i, specialist: 'SALES_QUALIFICATION' },
  { pattern: /account|invoice|billing|payment|subscription/i, specialist: 'ACCOUNT_SERVICE' },
  { pattern: /document|upload|form|intake/i, specialist: 'DOCUMENT_INTAKE' },
  { pattern: /complaint|frustrated|unhappy|manager/i, specialist: 'COMPLAINT_RESOLUTION' },
  { pattern: /support|problem|issue|status|service/i, specialist: 'CUSTOMER_SUPPORT' },
];

export function decideSpecialist(
  input: z.input<typeof OrchestrationInputSchema>
): OrchestrationDecision {
  const parsed = OrchestrationInputSchema.parse(input);
  if (parsed.requestedHuman || parsed.risk === 'CRITICAL' || parsed.complianceFlags.length > 0) {
    return {
      specialist: 'ESCALATION',
      requiresHuman: true,
      reason: parsed.requestedHuman
        ? 'CUSTOMER_REQUEST'
        : parsed.risk === 'CRITICAL'
          ? 'CRITICAL_RISK'
          : 'COMPLIANCE_REVIEW',
    };
  }
  const route = INTENT_ROUTES.find(candidate => candidate.pattern.test(parsed.intent));
  return {
    specialist: route?.specialist || 'GENERAL_RECEPTION',
    requiresHuman: false,
    reason: route ? 'INTENT_ROUTE' : 'GENERAL_FALLBACK',
  };
}

export async function persistOrchestrationDecision(
  conversationId: string,
  workspaceId: string,
  input: z.input<typeof OrchestrationInputSchema>
): Promise<OrchestrationDecision> {
  const parsed = OrchestrationInputSchema.parse(input);
  const decision = decideSpecialist(parsed);
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, workspaceId },
    select: { id: true },
  });
  if (!conversation) throw new Error('Conversation not found');
  await prisma.conversationState.upsert({
    where: { conversationId },
    create: {
      conversationId,
      currentIntent: parsed.intent,
      currentSpecialist: decision.specialist,
      collectedFields: parsed.collectedFields as Prisma.InputJsonObject,
      requestedOutcome: parsed.requestedOutcome,
      riskFlags: parsed.riskFlags,
      complianceFlags: parsed.complianceFlags,
      conversationSummary: parsed.summary,
      handoffState: decision.requiresHuman
        ? { status: 'REQUESTED', reason: decision.reason }
        : undefined,
    },
    update: {
      currentIntent: parsed.intent,
      currentSpecialist: decision.specialist,
      collectedFields: parsed.collectedFields as Prisma.InputJsonObject,
      requestedOutcome: parsed.requestedOutcome,
      riskFlags: parsed.riskFlags,
      complianceFlags: parsed.complianceFlags,
      conversationSummary: parsed.summary,
      handoffState: decision.requiresHuman
        ? { status: 'REQUESTED', reason: decision.reason }
        : undefined,
    },
  });
  return decision;
}
