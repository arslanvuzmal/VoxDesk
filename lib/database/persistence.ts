import { prisma } from './index';
import { FinalCallResult } from '@/lib/conversation/types/final-call-result';
import { encryptSensitiveValue } from '@/lib/security/encryption';

export function formatMaskedPhoneNumber(phone: string): string {
  if (!phone) return 'Not provided';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 4) {
    const last4 = digits.slice(-4);
    return `***-${last4}`;
  }
  return 'Not provided';
}

export async function persistFinalCallResult(
  result: FinalCallResult,
  targetWorkspaceId?: string
): Promise<{
  success: boolean;
  persisted: boolean;
  recordIds: {
    callId?: string;
    leadId?: string;
    appointmentId?: string;
    crmActivityId?: string;
    auditLogId?: string;
  };
  error?: string;
}> {
  try {
    const callerName =
      (result.accumulatedFields.fullName as string) ||
      (result.accumulatedFields.patientName as string) ||
      (result.accumulatedFields.customerName as string) ||
      'Not provided';

    const rawPhone =
      (result.accumulatedFields.contactPhone as string) ||
      (result.accumulatedFields.phone as string) ||
      '';

    const rawEmail =
      (result.accumulatedFields.workEmail as string) ||
      (result.accumulatedFields.email as string) ||
      '';

    const maskedPhone = formatMaskedPhoneNumber(rawPhone);
    const encryptedPhone = encryptSensitiveValue(rawPhone);
    const encryptedEmail = encryptSensitiveValue(rawEmail);

    const serviceInterest =
      (result.accumulatedFields.serviceInterest as string) ||
      (result.accumulatedFields.legalCategory as string) ||
      (result.accumulatedFields.issueCategory as string) ||
      'Not provided';

    // Use Prisma transaction to persist full record graph atomically
    const txResult = await prisma.$transaction(async (tx: any) => {
      // 1. Resolve Workspace and VoiceAgent records
      if (!targetWorkspaceId) {
        throw new Error('AUTHORIZED_WORKSPACE_REQUIRED');
      }
      const workspace = await tx.workspace.findUnique({ where: { id: targetWorkspaceId } });
      if (!workspace) {
        throw new Error('AUTHORIZED_WORKSPACE_NOT_FOUND');
      }
      const workspaceId = workspace.id;
      const agent = await tx.voiceAgent.findFirst({
        where: { workspaceId, status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' },
      });
      if (!agent) {
        throw new Error('AUTHORIZED_AGENT_NOT_FOUND');
      }
      const agentId = agent.id;

      // 2. Create Call Record with masked phone
      const call = await tx.call.create({
        data: {
          workspaceId,
          agentId,
          provider: 'ELEVENLABS',
          direction: 'INBOUND',
          callerNumberMasked: maskedPhone,
          callerName,
          status: 'COMPLETED',
          startedAt: new Date(result.startedAt),
          endedAt: new Date(result.endedAt),
          durationSeconds: result.durationSeconds,
          outcome: result.qualification ? 'LEAD_QUALIFIED' : null,
          qualificationCategory: result.qualification?.category as any,
          qualificationScore: result.qualification?.score,
        },
      });

      // 3. Create Transcript Segments
      if (result.transcript && result.transcript.length > 0) {
        await tx.transcriptSegment.createMany({
          data: result.transcript.map((t, idx) => ({
            callId: call.id,
            speaker: t.role.toLowerCase() === 'caller' ? 'caller' : 'agent',
            text: t.text,
            startMs: idx * 3000,
            endMs: (idx + 1) * 3000,
          })),
        });
      }

      // 4. Create Call Summary
      await tx.callSummary.create({
        data: {
          callId: call.id,
          summary: result.summary,
          intent: result.scenario,
          sentiment: 'Not provided',
          urgency: 'Not provided',
          actionItems: result.businessActions as any,
          commitments: [],
          followUpRecommendation: result.qualification?.recommendedAction,
        },
      });

      let leadId: string | undefined;
      // 5. Create Lead Record if lead qualification exists
      if (result.qualification) {
        const lead = await tx.lead.create({
          data: {
            workspaceId,
            callId: call.id,
            name: callerName,
            phoneEncrypted: encryptedPhone,
            emailEncrypted: encryptedEmail,
            serviceInterest,
            score: result.qualification.score,
            category: result.qualification.category as any,
            status: 'NEW',
          },
        });
        leadId = lead.id;
      }

      let appointmentId: string | undefined;
      // 6. Create Appointment Record if appointment action succeeded
      const apptAction = result.businessActions?.find(
        (a: any) => a.actionType === 'RESERVE_APPOINTMENT'
      ) as any;

      if (apptAction) {
        const startTime = apptAction.payload?.startTime
          ? new Date(apptAction.payload.startTime)
          : new Date(Date.now() + 86400000);
        const endTime = apptAction.payload?.endTime
          ? new Date(apptAction.payload.endTime)
          : new Date(startTime.getTime() + 45 * 60000);

        const appt = await tx.appointment.create({
          data: {
            workspaceId,
            callId: call.id,
            callerName,
            callerContactEncrypted: encryptedPhone,
            service: serviceInterest,
            startTime,
            endTime,
            timezone: workspace.timezone || 'UTC',
            status: 'CONFIRMED',
          },
        });
        appointmentId = appt.id;
      }

      // 7. Create CRM Activity Log
      const activity = await tx.cRMActivity.create({
        data: {
          workspaceId,
          activityType: 'CALL_LOG',
          details: {
            callId: call.id,
            duration: result.durationSeconds,
            summary: result.summary,
          },
          status: 'SYNCED',
        },
      });

      // 8. Create Audit Log
      const audit = await tx.auditLog.create({
        data: {
          workspaceId,
          action: 'VOICE_CALL_COMPLETED',
          entityType: 'CALL',
          entityId: call.id,
          metadata: {
            turns: result.turnsCompleted,
            providers: result.providersUsed as any,
          },
        },
      });

      return {
        callId: call.id,
        leadId,
        appointmentId,
        crmActivityId: activity.id,
        auditLogId: audit.id,
      };
    });

    return {
      success: true,
      persisted: true,
      recordIds: txResult,
    };
  } catch (error: any) {
    console.error('[DATABASE PERSISTENCE ERROR]:', error?.message || error);
    return {
      success: false,
      persisted: false,
      recordIds: {},
      error: error?.message || 'Database transaction failed',
    };
  }
}
