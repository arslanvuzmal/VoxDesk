import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/database';
import type { ConversationContext } from '@/lib/security/conversation-context';
import { initiateConfiguredHandoff } from '@/lib/telephony/handoffs/initiate-handoff';
import { encryptSensitiveValue } from '@/lib/security/encryption';
import {
  hashPhoneNumber,
  maskPhoneNumber,
  normalizePhoneNumber,
  phoneLast4,
} from '@/lib/security/identifiers';
import { evaluateToolPolicy, policyAuditFingerprint } from '@/lib/voice-agent/tool-policy';
import {
  deterministicToolPolicyEvaluator,
  fingerprintToolPayload,
} from '@/lib/security/tool-governance';

const ContactSchema = z
  .object({
    name: z.string().trim().min(2).max(200).optional(),
    company: z.string().trim().min(2).max(200).optional(),
    phone: z.string().trim().min(4).max(40).optional(),
    email: z.string().trim().email().max(320).optional(),
  })
  .refine(
    value => Object.values(value).some(item => item !== undefined),
    'Contact data is required.'
  );

const TaskSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueAt: z.string().datetime().optional(),
});

const CompleteTaskSchema = z.object({
  taskId: z.string().min(8).max(200),
});

const FollowUpSchema = z.object({
  type: z.enum(['CALLBACK', 'APPOINTMENT_CONFIRMATION', 'MISSING_INFORMATION', 'SURVEY']),
  preferredTime: z.string().datetime().optional(),
  preferredChannel: z.enum(['PHONE', 'TEXT', 'EMAIL']).default('PHONE'),
  notes: z.string().trim().max(2000).optional(),
});

const HandoffSchema = z.object({
  reason: z.string().trim().min(2).max(500),
  mode: z.enum(['WARM_TRANSFER', 'COLD_TRANSFER', 'CALLBACK', 'TASK', 'QUEUE']),
  brief: z.string().trim().max(2000).optional(),
});

const AppointmentWindowSchema = z
  .object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    timezone: z.string().trim().min(1).max(100).optional(),
  })
  .superRefine((value, ctx) => {
    const start = new Date(value.startTime);
    const end = new Date(value.endTime);
    if (end <= start) ctx.addIssue({ code: 'custom', message: 'End time must follow start time.' });
    if (end.getTime() - start.getTime() > 8 * 60 * 60 * 1000)
      ctx.addIssue({ code: 'custom', message: 'Appointment duration is too long.' });
  });

const BookAppointmentSchema = AppointmentWindowSchema.and(
  z.object({ service: z.string().trim().min(2).max(200) })
);

const RescheduleAppointmentSchema = AppointmentWindowSchema.and(
  z.object({ appointmentId: z.string().min(8).max(200) })
);

const CancelAppointmentSchema = z.object({ appointmentId: z.string().min(8).max(200) });

const CreateOpportunitySchema = z.object({
  title: z.string().trim().min(2).max(200),
  serviceInterest: z.string().trim().min(2).max(300).optional(),
  qualificationCriteria: z.array(z.string().trim().min(2).max(500)).min(1).max(20),
  evidence: z.array(z.string().trim().min(2).max(1000)).min(1).max(20),
  confidence: z.number().min(0).max(1).optional(),
  recommendation: z.string().trim().min(2).max(1000).optional(),
});

const UpdateOpportunitySchema = z
  .object({
    opportunityId: z.string().min(8).max(200),
    title: z.string().trim().min(2).max(200).optional(),
    serviceInterest: z.string().trim().min(2).max(300).optional(),
    stage: z.enum(['DISCOVERY', 'PROPOSAL']).optional(),
    qualificationCriteria: z.array(z.string().trim().min(2).max(500)).min(1).max(20).optional(),
    evidence: z.array(z.string().trim().min(2).max(1000)).min(1).max(20).optional(),
    confidence: z.number().min(0).max(1).optional(),
    recommendation: z.string().trim().min(2).max(1000).optional(),
  })
  .refine(
    value => Object.keys(value).some(key => key !== 'opportunityId'),
    'At least one opportunity field must be updated.'
  );

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map(key => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
    .join(',')}}`;
}

export function payloadFingerprint(parameters: Record<string, unknown>): string {
  return crypto.createHash('sha256').update(stableSerialize(parameters)).digest('hex');
}

export class ToolExecutionError extends Error {
  constructor(
    public readonly code:
      'VALIDATION' | 'AUTHORIZATION' | 'POLICY_DENIED' | 'CONFLICT' | 'NOT_FOUND',
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

export class ToolApprovalRequiredError extends Error {
  readonly code = 'APPROVAL_REQUIRED';
  readonly status = 202;

  constructor(public readonly approvalRequestId: string) {
    super('This action requires human approval before execution.');
  }
}

function jsonStringArray(value: Prisma.JsonValue | null | undefined): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function executionDataCategories(value: Prisma.JsonValue | null | undefined): string[] {
  if (!value || Array.isArray(value) || typeof value !== 'object') return [];
  return jsonStringArray((value as Prisma.JsonObject).dataCategories);
}

export async function assertPersistedConversationContext(context: ConversationContext) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: context.conversationId,
      workspaceId: context.workspaceId,
      businessId: context.businessId,
      ...(context.contactId ? { contactId: context.contactId } : {}),
      agentId: context.agentId,
      agentVersionId: context.agentVersionId,
      trainingPackVersionId: context.trainingPackVersionId,
      channel: context.channel,
      direction: context.direction,
      languageCode: context.language,
    },
    select: { id: true, workspaceId: true, contactId: true, callId: true, agentId: true },
  });
  if (!conversation) {
    throw new ToolExecutionError('AUTHORIZATION', 'Conversation context does not match.', 403);
  }
  return conversation;
}

type SupportedTool =
  | 'create_or_update_contact'
  | 'check_availability'
  | 'book_appointment'
  | 'reschedule_appointment'
  | 'cancel_appointment'
  | 'create_opportunity'
  | 'update_opportunity'
  | 'create_task'
  | 'complete_task'
  | 'schedule_callback'
  | 'create_follow_up'
  | 'record_opt_out'
  | 'request_human_handoff';

export function isSupportedDatabaseTool(tool: string): tool is SupportedTool {
  return [
    'create_or_update_contact',
    'check_availability',
    'book_appointment',
    'reschedule_appointment',
    'cancel_appointment',
    'create_opportunity',
    'update_opportunity',
    'create_task',
    'complete_task',
    'schedule_callback',
    'create_follow_up',
    'record_opt_out',
    'request_human_handoff',
  ].includes(tool);
}

export interface ToolExecutionOptions {
  approvalRequestId?: string;
}

export async function executeDatabaseTool(
  tool: SupportedTool,
  toolExecutionId: string,
  parameters: Record<string, unknown>,
  context: ConversationContext,
  options: ToolExecutionOptions = {}
): Promise<Prisma.JsonObject> {
  const conversation = await assertPersistedConversationContext(context);
  const payloadFingerprint = fingerprintToolPayload(tool, parameters);
  const operationFingerprint = payloadFingerprint;
  const inputFingerprint = payloadFingerprint;
  let approvedRequestId: string | null = null;
  const existing = await prisma.conversationToolExecution.findFirst({
    where: {
      conversationId: conversation.id,
      OR: [{ actionId: toolExecutionId }, { operationFingerprint }],
    },
    include: { approvalRequest: true },
  });

  if (existing) {
    if (
      existing.status === 'SUCCEEDED' &&
      existing.safeResult &&
      !Array.isArray(existing.safeResult)
    ) {
      return existing.safeResult as Prisma.JsonObject;
    }
    if (existing.status === 'BLOCKED') {
      throw new ToolExecutionError('POLICY_DENIED', 'Policy denied this action.', 403);
    }
    if (existing.status === 'PENDING_APPROVAL' && existing.approvalRequest) {
      const approval = existing.approvalRequest;
      if (
        !options.approvalRequestId ||
        options.approvalRequestId !== approval.id ||
        approval.payloadFingerprint !== payloadFingerprint
      ) {
        throw new ToolApprovalRequiredError(approval.id);
      }
      if (approval.expiresAt <= new Date()) {
        await prisma.toolApprovalRequest.updateMany({
          where: { id: approval.id, status: { in: ['PENDING', 'APPROVED'] } },
          data: { status: 'EXPIRED' },
        });
        throw new ToolExecutionError('AUTHORIZATION', 'Tool approval has expired.', 403);
      }
      if (approval.status === 'DENIED') {
        throw new ToolExecutionError('POLICY_DENIED', 'Human approval was denied.', 403);
      }
      if (approval.status !== 'APPROVED') {
        throw new ToolApprovalRequiredError(approval.id);
      }
      const claimed = await prisma.conversationToolExecution.updateMany({
        where: { id: existing.id, status: 'PENDING_APPROVAL' },
        data: { status: 'EXECUTING' },
      });
      if (claimed.count !== 1) {
        throw new ToolExecutionError(
          'CONFLICT',
          'This approved action is already being executed.',
          409
        );
      }
      approvedRequestId = approval.id;
    } else {
      throw new ToolExecutionError(
        'CONFLICT',
        'This tool execution is already in progress or failed.',
        409
      );
    }
  } else {
    const [state, history] = await Promise.all([
      prisma.conversationState.findUnique({
        where: { conversationId: conversation.id },
        select: {
          currentSpecialist: true,
          identityVerificationState: true,
          riskFlags: true,
          complianceFlags: true,
        },
      }),
      prisma.conversationToolExecution.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: 'desc' },
        take: 25,
        select: { tool: true, status: true, safeInput: true },
      }),
    ]);
    const decision = await deterministicToolPolicyEvaluator.evaluate({
      sessionId: conversation.id,
      workspaceId: context.workspaceId,
      agentId: context.agentId,
      contactId: context.contactId,
      specialist: state?.currentSpecialist || null,
      tool,
      parameters,
      identityVerificationState: state?.identityVerificationState || null,
      riskFlags: jsonStringArray(state?.riskFlags),
      complianceFlags: jsonStringArray(state?.complianceFlags),
      history: history.map(entry => ({
        tool: entry.tool,
        status: entry.status,
        dataCategories: executionDataCategories(entry.safeInput),
      })),
    });
    const safeInput = {
      parameterKeys: Object.keys(parameters).sort(),
      dataCategories: decision.dataCategories,
    };
    const executionData = {
      conversationId: conversation.id,
      tool,
      actionId: toolExecutionId,
      operationFingerprint,
      payloadFingerprint,
      safeInput,
      status:
        decision.outcome === 'DENY'
          ? ('BLOCKED' as const)
          : decision.outcome === 'ESCALATE'
            ? ('PENDING_APPROVAL' as const)
            : ('EXECUTING' as const),
      policyOutcome: decision.outcome,
      policyVersion: decision.policyVersion,
      riskLevel: decision.riskLevel,
      riskScore: decision.riskScore,
      triggeredPolicyIds: decision.triggeredPolicyIds,
      decisionReasonCodes: decision.reasonCodes,
    };

    try {
      if (decision.outcome === 'ESCALATE') {
        const approval = await prisma.$transaction(async tx => {
          const execution = await tx.conversationToolExecution.create({ data: executionData });
          const request = await tx.toolApprovalRequest.create({
            data: {
              workspaceId: context.workspaceId,
              conversationId: conversation.id,
              toolExecutionId: execution.id,
              actionId: toolExecutionId,
              tool,
              payloadFingerprint,
              policyVersion: decision.policyVersion,
              riskLevel: decision.riskLevel,
              riskScore: decision.riskScore,
              triggeredPolicyIds: decision.triggeredPolicyIds,
              reasonCodes: decision.reasonCodes,
              expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
          });
          await tx.auditLog.create({
            data: {
              workspaceId: context.workspaceId,
              action: 'TOOL_POLICY_ESCALATED',
              entityType: 'TOOL_APPROVAL_REQUEST',
              entityId: request.id,
              metadata: {
                sessionId: conversation.id,
                agentId: context.agentId,
                specialist: state?.currentSpecialist || 'UNASSIGNED',
                tool,
                actionId: toolExecutionId,
                payloadFingerprint,
                policyVersion: decision.policyVersion,
                riskLevel: decision.riskLevel,
                riskScore: decision.riskScore,
                triggeredPolicyIds: decision.triggeredPolicyIds,
                reasonCodes: decision.reasonCodes,
              },
            },
          });
          return request;
        });
        throw new ToolApprovalRequiredError(approval.id);
      }

      await prisma.$transaction([
        prisma.conversationToolExecution.create({ data: executionData }),
        prisma.auditLog.create({
          data: {
            workspaceId: context.workspaceId,
            action: decision.outcome === 'DENY' ? 'TOOL_POLICY_DENIED' : 'TOOL_POLICY_ALLOWED',
            entityType: 'CONVERSATION_TOOL_EXECUTION',
            entityId: conversation.id,
            metadata: {
              sessionId: conversation.id,
              agentId: context.agentId,
              specialist: state?.currentSpecialist || 'UNASSIGNED',
              tool,
              actionId: toolExecutionId,
              payloadFingerprint,
              policyVersion: decision.policyVersion,
              riskLevel: decision.riskLevel,
              riskScore: decision.riskScore,
              triggeredPolicyIds: decision.triggeredPolicyIds,
              reasonCodes: decision.reasonCodes,
            },
          },
        }),
      ]);
      if (decision.outcome === 'DENY') {
        throw new ToolExecutionError('POLICY_DENIED', 'Policy denied this action.', 403);
      }
    } catch (error) {
      if (error instanceof ToolApprovalRequiredError || error instanceof ToolExecutionError) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const raced = await prisma.conversationToolExecution.findFirst({
          where: {
            conversationId: conversation.id,
            OR: [{ actionId: toolExecutionId }, { operationFingerprint }],
          },
          include: { approvalRequest: true },
        });
        if (raced?.status === 'SUCCEEDED' && raced.safeResult && !Array.isArray(raced.safeResult)) {
          return raced.safeResult as Prisma.JsonObject;
        }
        if (raced?.status === 'PENDING_APPROVAL' && raced.approvalRequest) {
          throw new ToolApprovalRequiredError(raced.approvalRequest.id);
        }
        throw new ToolExecutionError(
          'CONFLICT',
          'This tool execution is already in progress.',
          409
        );
      }
      throw error;
    }
  }

  try {
    const result = await prisma.$transaction(
      async tx => {
        let safeResult: Prisma.JsonObject;
        if (tool === 'create_or_update_contact') {
          const input = ContactSchema.parse(parameters);
          const normalizedPhone = input.phone ? normalizePhoneNumber(input.phone) : null;
          const phoneHash = normalizedPhone ? hashPhoneNumber(normalizedPhone) : null;
          const normalizedEmail = input.email?.trim().toLowerCase() || null;
          let contact = conversation.contactId
            ? await tx.contact.findFirst({
                where: { id: conversation.contactId, workspaceId: context.workspaceId },
              })
            : phoneHash
              ? await tx.contact.findFirst({
                  where: { workspaceId: context.workspaceId, phoneHash },
                })
              : null;
          const matchedExisting = Boolean(contact && !conversation.contactId);
          if (!contact && !input.name)
            throw new ToolExecutionError(
              'VALIDATION',
              'A name is required to create a new contact.',
              400
            );

          const contactData = {
            name: input.name,
            company: input.company,
            preferredLanguage: context.language,
            phoneEncrypted: normalizedPhone ? encryptSensitiveValue(normalizedPhone) : undefined,
            phoneHash: phoneHash || undefined,
            phoneMasked: normalizedPhone ? maskPhoneNumber(normalizedPhone) : undefined,
            phoneLast4: normalizedPhone ? phoneLast4(normalizedPhone) : undefined,
            emailEncrypted: normalizedEmail ? encryptSensitiveValue(normalizedEmail) : undefined,
          };
          if (contact) {
            contact = await tx.contact.update({
              where: { id: contact.id },
              data: contactData,
            });
          } else {
            contact = await tx.contact.create({
              data: {
                workspaceId: context.workspaceId,
                ...contactData,
                name: input.name!,
              },
            });
          }

          if (!conversation.contactId) {
            const linked = await tx.conversation.updateMany({
              where: {
                id: conversation.id,
                workspaceId: context.workspaceId,
                contactId: null,
              },
              data: { contactId: contact.id },
            });
            if (linked.count !== 1)
              throw new ToolExecutionError(
                'CONFLICT',
                'Conversation contact changed while this request was processed.',
                409
              );
            if (conversation.callId) {
              await tx.call.updateMany({
                where: { id: conversation.callId, workspaceId: context.workspaceId },
                data: { contactId: contact.id },
              });
            }
          }
          safeResult = {
            contactId: contact.id,
            status: matchedExisting
              ? 'MATCHED_AND_UPDATED'
              : conversation.contactId
                ? 'UPDATED'
                : 'CREATED',
            contextRefreshRequired: context.contactId !== contact.id,
          };
        } else if (
          tool === 'check_availability' ||
          tool === 'book_appointment' ||
          tool === 'reschedule_appointment'
        ) {
          const input = AppointmentWindowSchema.parse(parameters);
          const bookInput =
            tool === 'book_appointment' ? BookAppointmentSchema.parse(parameters) : null;
          const rescheduleInput =
            tool === 'reschedule_appointment'
              ? RescheduleAppointmentSchema.parse(parameters)
              : null;
          const startTime = new Date(input.startTime);
          const endTime = new Date(input.endTime);
          if (startTime <= new Date())
            throw new ToolExecutionError(
              'VALIDATION',
              'Appointment time must be in the future.',
              400
            );

          const business = await tx.businessProfile.findFirst({
            where: { id: context.businessId, workspaceId: context.workspaceId },
            select: { timezone: true },
          });
          if (!business)
            throw new ToolExecutionError('AUTHORIZATION', 'Business context does not match.', 403);
          const timezone = input.timezone || business.timezone;
          try {
            new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(startTime);
          } catch {
            throw new ToolExecutionError('VALIDATION', 'Appointment timezone is invalid.', 400);
          }

          const appointmentId = rescheduleInput?.appointmentId;
          const collision = await tx.appointment.findFirst({
            where: {
              workspaceId: context.workspaceId,
              id: appointmentId ? { not: appointmentId } : undefined,
              status: { in: ['PENDING', 'CONFIRMED', 'RESCHEDULED'] },
              startTime: { lt: endTime },
              endTime: { gt: startTime },
            },
            select: { id: true },
          });
          if (tool === 'check_availability') {
            safeResult = {
              available: !collision,
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
              timezone,
              source: 'VOXDESK_DATABASE',
            };
          } else if (collision) {
            throw new ToolExecutionError(
              'CONFLICT',
              'The requested appointment time is no longer available.',
              409
            );
          } else if (tool === 'book_appointment') {
            if (!conversation.contactId)
              throw new ToolExecutionError(
                'VALIDATION',
                'A verified contact is required before booking.',
                400
              );
            const contact = await tx.contact.findFirst({
              where: { id: conversation.contactId, workspaceId: context.workspaceId },
              select: { id: true, name: true },
            });
            if (!contact)
              throw new ToolExecutionError('AUTHORIZATION', 'Contact context does not match.', 403);
            const existingConversationAppointment = await tx.appointment.findFirst({
              where: {
                workspaceId: context.workspaceId,
                status: { in: ['PENDING', 'CONFIRMED', 'RESCHEDULED'] },
                OR: [
                  { conversationId: conversation.id },
                  ...(conversation.callId ? [{ callId: conversation.callId }] : []),
                ],
              },
              select: { id: true },
            });
            if (existingConversationAppointment)
              throw new ToolExecutionError(
                'CONFLICT',
                'This conversation already has an active appointment.',
                409
              );
            const record = await tx.appointment.create({
              data: {
                workspaceId: context.workspaceId,
                contactId: contact.id,
                conversationId: conversation.id,
                callId: conversation.callId,
                callerName: contact.name,
                service: bookInput!.service,
                startTime,
                endTime,
                timezone,
                status: 'CONFIRMED',
                confirmationStatus: 'CONFIRMED_INTERNAL',
              },
            });
            safeResult = {
              appointmentId: record.id,
              status: record.status,
              startTime: record.startTime.toISOString(),
              endTime: record.endTime.toISOString(),
              timezone: record.timezone,
              provider: 'VOXDESK_DATABASE',
            };
          } else {
            if (!conversation.contactId)
              throw new ToolExecutionError(
                'VALIDATION',
                'A verified contact is required before rescheduling.',
                400
              );
            const existingAppointment = await tx.appointment.findFirst({
              where: {
                id: rescheduleInput!.appointmentId,
                workspaceId: context.workspaceId,
                contactId: conversation.contactId,
                status: { in: ['PENDING', 'CONFIRMED', 'RESCHEDULED'] },
              },
            });
            if (!existingAppointment)
              throw new ToolExecutionError('NOT_FOUND', 'Appointment was not found.', 404);
            const record = await tx.appointment.update({
              where: { id: existingAppointment.id },
              data: {
                conversationId: conversation.id,
                startTime,
                endTime,
                timezone,
                status: 'RESCHEDULED',
                confirmationStatus: 'CONFIRMED_INTERNAL',
              },
            });
            safeResult = {
              appointmentId: record.id,
              status: record.status,
              startTime: record.startTime.toISOString(),
              endTime: record.endTime.toISOString(),
              timezone: record.timezone,
              provider: 'VOXDESK_DATABASE',
            };
          }
        } else if (tool === 'cancel_appointment') {
          const input = CancelAppointmentSchema.parse(parameters);
          if (!conversation.contactId)
            throw new ToolExecutionError(
              'VALIDATION',
              'A verified contact is required before cancellation.',
              400
            );
          const existingAppointment = await tx.appointment.findFirst({
            where: {
              id: input.appointmentId,
              workspaceId: context.workspaceId,
              contactId: conversation.contactId,
              status: { in: ['PENDING', 'CONFIRMED', 'RESCHEDULED'] },
            },
            select: { id: true },
          });
          if (!existingAppointment)
            throw new ToolExecutionError('NOT_FOUND', 'Appointment was not found.', 404);
          const record = await tx.appointment.update({
            where: { id: existingAppointment.id },
            data: {
              conversationId: conversation.id,
              status: 'CANCELLED',
              confirmationStatus: 'CANCELLED_INTERNAL',
            },
          });
          safeResult = { appointmentId: record.id, status: record.status };
        } else if (tool === 'create_opportunity') {
          const input = CreateOpportunitySchema.parse(parameters);
          if (!conversation.contactId)
            throw new ToolExecutionError(
              'VALIDATION',
              'A verified contact is required before creating an opportunity.',
              400
            );
          const contact = await tx.contact.findFirst({
            where: { id: conversation.contactId, workspaceId: context.workspaceId },
            select: { id: true },
          });
          if (!contact)
            throw new ToolExecutionError('AUTHORIZATION', 'Contact context does not match.', 403);
          const existingOpportunity = await tx.opportunity.findUnique({
            where: { sourceConversationId: conversation.id },
            select: { id: true },
          });
          if (existingOpportunity)
            throw new ToolExecutionError(
              'CONFLICT',
              'This conversation already created an opportunity.',
              409
            );
          const record = await tx.opportunity.create({
            data: {
              workspaceId: context.workspaceId,
              contactId: contact.id,
              sourceConversationId: conversation.id,
              title: input.title,
              serviceInterest: input.serviceInterest,
              qualificationCriteria: input.qualificationCriteria,
              evidence: input.evidence,
              confidence: input.confidence,
              recommendation: input.recommendation,
              stage: 'QUALIFIED',
            },
          });
          safeResult = {
            opportunityId: record.id,
            stage: record.stage,
            evidenceRecorded: input.evidence.length,
            criteriaRecorded: input.qualificationCriteria.length,
          };
        } else if (tool === 'update_opportunity') {
          const input = UpdateOpportunitySchema.parse(parameters);
          if (!conversation.contactId)
            throw new ToolExecutionError(
              'VALIDATION',
              'A verified contact is required before updating an opportunity.',
              400
            );
          const existingOpportunity = await tx.opportunity.findFirst({
            where: {
              id: input.opportunityId,
              workspaceId: context.workspaceId,
              contactId: conversation.contactId,
            },
            select: { id: true },
          });
          if (!existingOpportunity)
            throw new ToolExecutionError('NOT_FOUND', 'Opportunity was not found.', 404);
          const record = await tx.opportunity.update({
            where: { id: existingOpportunity.id },
            data: {
              title: input.title,
              serviceInterest: input.serviceInterest,
              stage: input.stage,
              qualificationCriteria: input.qualificationCriteria,
              evidence: input.evidence,
              confidence: input.confidence,
              recommendation: input.recommendation,
            },
          });
          safeResult = { opportunityId: record.id, stage: record.stage };
        } else if (tool === 'create_task') {
          const input = TaskSchema.parse(parameters);
          const record = await tx.task.create({
            data: {
              workspaceId: context.workspaceId,
              title: input.title,
              description: input.description,
              priority: input.priority,
              dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
              sourceType: 'CONVERSATION',
              sourceId: conversation.id,
            },
          });
          safeResult = { taskId: record.id, status: record.status };
        } else if (tool === 'complete_task') {
          const input = CompleteTaskSchema.parse(parameters);
          const task = await tx.task.findFirst({
            where: {
              id: input.taskId,
              workspaceId: context.workspaceId,
              sourceType: 'CONVERSATION',
              sourceId: conversation.id,
              status: 'PENDING',
            },
            select: { id: true },
          });
          if (!task) throw new ToolExecutionError('NOT_FOUND', 'Pending task was not found.', 404);
          const completed = await tx.task.update({
            where: { id: task.id },
            data: { status: 'COMPLETED', completedAt: new Date() },
          });
          safeResult = { taskId: completed.id, status: completed.status };
        } else if (tool === 'create_follow_up' || tool === 'schedule_callback') {
          const input = FollowUpSchema.parse(
            tool === 'schedule_callback' ? { ...parameters, type: 'CALLBACK' } : parameters
          );
          const record = await tx.followUp.create({
            data: {
              workspaceId: context.workspaceId,
              callId: conversation.callId,
              contactId: conversation.contactId,
              followUpType: input.type,
              preferredTime: input.preferredTime ? new Date(input.preferredTime) : undefined,
              preferredChannel: input.preferredChannel,
              notes: input.notes,
            },
          });
          safeResult = { followUpId: record.id, status: record.status, type: record.followUpType };
        } else if (tool === 'record_opt_out') {
          if (!conversation.contactId)
            throw new ToolExecutionError(
              'VALIDATION',
              'A verified contact is required for opt-out.',
              400
            );
          const contact = await tx.contact.findFirst({
            where: { id: conversation.contactId, workspaceId: context.workspaceId },
            select: { id: true, phoneHash: true },
          });
          if (!contact?.phoneHash)
            throw new ToolExecutionError(
              'VALIDATION',
              'The contact has no verified telephone identifier.',
              400
            );
          await tx.communicationPreference.upsert({
            where: { contactId: contact.id },
            create: {
              workspaceId: context.workspaceId,
              contactId: contact.id,
              preferredLanguage: context.language,
              doNotCall: true,
            },
            update: { doNotCall: true },
          });
          const suppression = await tx.suppressionEntry.findFirst({
            where: {
              workspaceId: context.workspaceId,
              phoneHash: contact.phoneHash,
              reason: 'DO_NOT_CALL',
            },
          });
          const entry =
            suppression ||
            (await tx.suppressionEntry.create({
              data: {
                workspaceId: context.workspaceId,
                contactId: contact.id,
                phoneHash: contact.phoneHash,
                reason: 'DO_NOT_CALL',
                source: 'CONVERSATION_TOOL',
              },
            }));
          safeResult = { suppressionId: entry.id, status: 'RECORDED' };
        } else {
          const input = HandoffSchema.parse(parameters);
          const configuredAgent = await tx.voiceAgent.findFirst({
            where: { id: conversation.agentId || '', workspaceId: context.workspaceId },
            include: { escalationPolicy: true },
          });
          const needsTransferTarget = ['WARM_TRANSFER', 'COLD_TRANSFER', 'QUEUE'].includes(
            input.mode
          );
          if (
            needsTransferTarget &&
            (!configuredAgent?.escalationPolicy || !configuredAgent.escalationPolicy.targetPhoneEnc)
          ) {
            throw new ToolExecutionError(
              'VALIDATION',
              'No authorized human handoff destination is configured.',
              409
            );
          }
          const destination = needsTransferTarget
            ? configuredAgent!.escalationPolicy!.name
            : input.mode === 'CALLBACK'
              ? 'CONFIGURED_CALLBACK_WORKFLOW'
              : 'CONFIGURED_TEAM_TASK';
          const handoff = await tx.handoff.create({
            data: {
              workspaceId: context.workspaceId,
              callId: conversation.callId,
              agentId: conversation.agentId,
              reason: input.reason,
              destination,
              result: 'REQUESTED',
              briefText: input.brief,
            },
          });
          safeResult = {
            handoffId: handoff.id,
            status: 'REQUESTED',
            mode: input.mode,
            providerTransferConfirmed: false,
          };
        }
        await tx.conversationToolExecution.update({
          where: {
            conversationId_operationFingerprint: {
              conversationId: conversation.id,
              operationFingerprint,
            },
          },
          data: { status: 'SUCCEEDED', safeResult },
        });
        if (approvedRequestId) {
          await tx.toolApprovalRequest.updateMany({
            where: { id: approvedRequestId, status: 'APPROVED' },
            data: { status: 'CONSUMED', consumedAt: new Date() },
          });
        }
        await tx.auditLog.create({
          data: {
            workspaceId: context.workspaceId,
            action:
              tool === 'create_or_update_contact'
                ? 'CONTACT_UPDATED'
                : tool === 'book_appointment'
                  ? 'APPOINTMENT_CREATED'
                  : tool === 'reschedule_appointment'
                    ? 'APPOINTMENT_RESCHEDULED'
                    : tool === 'cancel_appointment'
                      ? 'APPOINTMENT_CANCELLED'
                      : tool === 'check_availability'
                        ? 'APPOINTMENT_AVAILABILITY_CHECKED'
                        : tool === 'create_opportunity'
                          ? 'OPPORTUNITY_CREATED'
                          : tool === 'update_opportunity'
                            ? 'OPPORTUNITY_UPDATED'
                            : tool === 'record_opt_out'
                              ? 'OPT_OUT_RECORDED'
                              : tool === 'request_human_handoff'
                                ? 'HANDOFF_REQUESTED'
                                : tool === 'create_task'
                                  ? 'TASK_CREATED'
                                  : tool === 'complete_task'
                                    ? 'TASK_COMPLETED'
                                    : 'FOLLOW_UP_CREATED',
            entityType: 'CONVERSATION_TOOL_EXECUTION',
            entityId: conversation.id,
            metadata: { tool, operationFingerprint },
          },
        });
        return safeResult;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
    if (tool === 'request_human_handoff') {
      const input = HandoffSchema.parse(parameters);
      if (['WARM_TRANSFER', 'COLD_TRANSFER', 'QUEUE'].includes(input.mode)) {
        if (!conversation.callId || !conversation.agentId) {
          const failed = {
            handoffId: String(result.handoffId),
            status: 'FAILED',
            providerTransferConfirmed: false,
          } satisfies Prisma.JsonObject;
          await prisma.conversationToolExecution.update({
            where: {
              conversationId_operationFingerprint: {
                conversationId: conversation.id,
                operationFingerprint,
              },
            },
            data: { status: 'FAILED', safeResult: failed, errorCategory: 'BUSINESS_RULE' },
          });
          return failed;
        }
        const initiated = await initiateConfiguredHandoff(
          String(result.handoffId),
          context.workspaceId,
          conversation.agentId,
          conversation.callId,
          toolExecutionId
        );
        const safeResult = { ...result, ...initiated } satisfies Prisma.JsonObject;
        await prisma.conversationToolExecution.update({
          where: {
            conversationId_operationFingerprint: {
              conversationId: conversation.id,
              operationFingerprint,
            },
          },
          data: {
            status: initiated.status === 'FAILED' ? 'FAILED' : 'SUCCEEDED',
            safeResult,
            errorCategory: initiated.status === 'FAILED' ? 'PROVIDER_UNAVAILABLE' : null,
          },
        });
        return safeResult;
      }
    }
    return result;
  } catch (error) {
    await prisma.conversationToolExecution
      .update({
        where: {
          conversationId_operationFingerprint: {
            conversationId: conversation.id,
            operationFingerprint,
          },
        },
        data: {
          status: 'FAILED',
          errorCategory:
            error instanceof z.ZodError
              ? 'VALIDATION'
              : error instanceof ToolExecutionError
                ? error.code
                : 'UNKNOWN',
        },
      })
      .catch(() => undefined);
    if (error instanceof z.ZodError)
      throw new ToolExecutionError('VALIDATION', 'Tool parameters are invalid.', 400);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034')
      throw new ToolExecutionError(
        'CONFLICT',
        'The appointment changed while this request was processed. Please check availability again.',
        409
      );
    throw error;
  }
}
