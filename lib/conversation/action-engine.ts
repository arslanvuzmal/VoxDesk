import { prisma } from '@/lib/database';
import { getOrganizationProfile } from '@/lib/organization/registry';
import { calculateLeadQualification } from './qualification';
import { getAvailableSlots } from '@/lib/calendar/availability-service';
import { encryptSensitiveValue } from '@/lib/security/encryption';
import { BusinessActionType } from './schemas/voice-agent-output';

export { type BusinessActionType };

export interface BusinessActionRequest {
  actionType: BusinessActionType;
  workspaceId: string;
  presetKey?: string;
  callId?: string;
  sessionId: string;
  callerName?: string;
  callerPhone?: string;
  callerEmail?: string;
  company?: string;
  service?: string;
  language?: string;
  appointmentTime?: string;
  transcriptText?: string;
  extractedFields?: Record<string, any>;
  userConfirmed?: boolean;
}

export interface BusinessActionResult {
  success: boolean;
  persisted: boolean;
  actionType: BusinessActionType;
  status: 'COMPLETED' | 'PENDING_CONFIRMATION' | 'SKIPPED' | 'FAILED';
  message: string;
  recordIds: {
    callId?: string;
    leadId?: string;
    appointmentId?: string;
    crmActivityId?: string;
    auditLogId?: string;
    notificationId?: string;
  };
  details: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
  };
}

function assertNever(x: never): never {
  throw new Error(`Unexpected unhandled action type: ${JSON.stringify(x)}`);
}

export async function executeBusinessAction(
  req: BusinessActionRequest
): Promise<BusinessActionResult> {
  const profile = getOrganizationProfile(req.presetKey);
  const workspaceId = req.workspaceId.trim();
  if (!workspaceId) {
    return {
      success: false,
      persisted: false,
      actionType: req.actionType,
      status: 'FAILED',
      message: 'A trusted workspace context is required for business actions.',
      recordIds: {},
      details: {},
      error: { code: 'WORKSPACE_CONTEXT_REQUIRED', message: 'The action was not authorized for a workspace.' },
    };
  }

  const callerName =
    req.callerName ||
    req.extractedFields?.fullName ||
    req.extractedFields?.customerName ||
    req.extractedFields?.patientName ||
    'Not provided';

  const callerPhone =
    req.callerPhone || req.extractedFields?.contactPhone || req.extractedFields?.phone || '';

  const callerEmail =
    req.callerEmail || req.extractedFields?.workEmail || req.extractedFields?.email || '';

  const service =
    req.service ||
    req.extractedFields?.legalCategory ||
    req.extractedFields?.issueCategory ||
    req.extractedFields?.primarySymptom ||
    profile.services[0]?.name ||
    'Not provided';

  switch (req.actionType) {
    case 'NONE': {
      return {
        success: true,
        persisted: false,
        actionType: 'NONE',
        status: 'SKIPPED',
        message: 'No business action required for turn.',
        recordIds: {},
        details: {},
      };
    }

    case 'ANSWER_APPROVED_QUESTION': {
      return {
        success: true,
        persisted: false,
        actionType: 'ANSWER_APPROVED_QUESTION',
        status: 'COMPLETED',
        message: 'Approved FAQ response provided from profile knowledge.',
        recordIds: {},
        details: {
          organization: profile.name,
          scenario: 'ROUTINE',
        },
      };
    }

    case 'CHECK_AVAILABILITY': {
      try {
        const slots = await getAvailableSlots(profile, req.extractedFields?.preferredDate, workspaceId);
        return {
          success: true,
          persisted: false,
          actionType: 'CHECK_AVAILABILITY',
          status: 'COMPLETED',
          message: `Checked real calendar availability. Found ${slots.length} available slots.`,
          recordIds: {},
          details: {
            availableSlots: slots,
            timezone: profile.timeZone,
          },
        };
      } catch (err: any) {
        return {
          success: false,
          persisted: false,
          actionType: 'CHECK_AVAILABILITY',
          status: 'FAILED',
          message: 'Failed to check calendar availability.',
          recordIds: {},
          details: {},
          error: {
            code: 'AVAILABILITY_UNAVAILABLE',
            message: err?.message || 'Database calendar query failed',
          },
        };
      }
    }

    case 'RESERVE_APPOINTMENT': {
      if (!req.userConfirmed) {
        return {
          success: true,
          persisted: false,
          actionType: 'RESERVE_APPOINTMENT',
          status: 'PENDING_CONFIRMATION',
          message: 'Appointment details captured. Awaiting explicit caller confirmation.',
          recordIds: {},
          details: {
            service,
            callerName,
            appointmentTime: req.appointmentTime || 'Requested slot',
          },
        };
      }

      const startTime = req.appointmentTime
        ? new Date(req.appointmentTime)
        : new Date(Date.now() + 86400000 * 2);
      const endTime = new Date(
        startTime.getTime() + profile.appointmentSettings.slotDurationMinutes * 60000
      );

      try {
        const appt = await prisma.appointment.create({
          data: {
            workspaceId,
            callerName,
            callerContactEncrypted: callerPhone
              ? encryptSensitiveValue(callerPhone)
              : 'enc:v1:none',
            service,
            startTime,
            endTime,
            timezone: profile.timeZone,
            status: 'CONFIRMED',
            confirmationStatus: 'CONFIRMED',
          },
        });

        return {
          success: true,
          persisted: true,
          actionType: 'RESERVE_APPOINTMENT',
          status: 'COMPLETED',
          message: `Confirmed appointment reservation for ${callerName} at ${startTime.toLocaleString()}`,
          recordIds: { appointmentId: appt.id },
          details: {
            appointmentId: appt.id,
            service,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            timezone: profile.timeZone,
          },
        };
      } catch (dbErr: any) {
        return {
          success: false,
          persisted: false,
          actionType: 'RESERVE_APPOINTMENT',
          status: 'FAILED',
          message: 'Database failed to persist appointment reservation.',
          recordIds: {},
          details: {},
          error: {
            code: 'DATABASE_UNAVAILABLE',
            message: dbErr?.message || 'Appointment table insert failed',
          },
        };
      }
    }

    case 'SCORE_LEAD':
    case 'CREATE_LEAD': {
      const qual = calculateLeadQualification(
        {
          serviceInterest: service,
          budgetRange:
            req.extractedFields?.budgetRange ||
            req.extractedFields?.priceBudget ||
            req.extractedFields?.estimatedBudget,
          timeline: req.extractedFields?.timeline || req.extractedFields?.buyingTimeline,
          authority: req.extractedFields?.authority,
          urgency: req.extractedFields?.urgencyLevel || req.extractedFields?.isEmergency,
          extractedFields: req.extractedFields,
        },
        profile
      );

      try {
        const lead = await prisma.lead.create({
          data: {
            workspaceId,
            name: callerName,
            phoneEncrypted: callerPhone ? encryptSensitiveValue(callerPhone) : 'enc:v1:none',
            emailEncrypted: callerEmail ? encryptSensitiveValue(callerEmail) : 'enc:v1:none',
            company: req.company || req.extractedFields?.companyName || 'Not provided',
            serviceInterest: service,
            score: qual.score,
            category: qual.category,
            status: 'NEW',
          },
        });

        return {
          success: true,
          persisted: true,
          actionType: req.actionType,
          status: 'COMPLETED',
          message: `Lead intake recorded in CRM database. Score ${qual.score}/100 (${qual.category})`,
          recordIds: { leadId: lead.id },
          details: {
            leadId: lead.id,
            score: qual.score,
            category: qual.category,
            recommendedAction: qual.recommendedAction,
            breakdown: qual.breakdown,
            missingFields: qual.missingFields,
          },
        };
      } catch (dbErr: any) {
        return {
          success: false,
          persisted: false,
          actionType: req.actionType,
          status: 'FAILED',
          message: 'Database failed to persist lead intake record.',
          recordIds: {},
          details: {},
          error: {
            code: 'DATABASE_UNAVAILABLE',
            message: dbErr?.message || 'Lead table insert failed',
          },
        };
      }
    }

    case 'UPDATE_LEAD':
    case 'PREPARE_FOLLOW_UP': {
      return {
        success: true,
        persisted: false,
        actionType: req.actionType,
        status: 'COMPLETED',
        message: `Prepared lead follow-up task for ${profile.name}`,
        recordIds: {},
        details: {
          callerName,
          service,
          followUpPriority: 'HIGH',
        },
      };
    }

    case 'PREPARE_HANDOFF':
    case 'REQUEST_HUMAN_REVIEW': {
      return {
        success: true,
        persisted: false,
        actionType: req.actionType,
        status: 'COMPLETED',
        message: `Emergency / Human escalation prepared for ${profile.escalationDestination.department}`,
        recordIds: {},
        details: {
          department: profile.escalationDestination.department,
          phone: profile.escalationDestination.phone,
          reason: req.extractedFields?.reason || 'Immediate caller escalation request',
          urgency: 'CRITICAL',
        },
      };
    }

    case 'COMPLETE_CALL': {
      return {
        success: true,
        persisted: false,
        actionType: 'COMPLETE_CALL',
        status: 'COMPLETED',
        message: 'Call wrap-up sequence triggered.',
        recordIds: {},
        details: {},
      };
    }

    default:
      return assertNever(req.actionType);
  }
}
