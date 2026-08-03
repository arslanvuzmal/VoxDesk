import { prisma } from "@/lib/database";
import { getOrganizationProfile } from "@/lib/organization/registry";
import { calculateLeadQualification } from "./qualification";

export interface BusinessActionRequest {
  actionType:
    | "checkAvailability"
    | "reserveAppointment"
    | "scoreLead"
    | "createLead"
    | "updateLead"
    | "prepareFollowUp"
    | "prepareHandoff"
    | "answerApprovedQuestion"
    | "requestHumanReview"
    | "completeCall";
  workspaceId?: string;
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
  actionType: string;
  statusMessage: string;
  recordIds: {
    callId?: string;
    leadId?: string;
    appointmentId?: string;
    crmActivityId?: string;
    auditLogId?: string;
  };
  details: Record<string, any>;
}

export async function executeBusinessAction(
  req: BusinessActionRequest,
): Promise<BusinessActionResult> {
  const profile = getOrganizationProfile(req.presetKey);
  const workspaceId = req.workspaceId || "ws_demo_default";
  const callerName =
    req.callerName ||
    req.extractedFields?.fullName ||
    req.extractedFields?.customerName ||
    req.extractedFields?.patientName ||
    "Anonymous Visitor";
  const callerPhone =
    req.callerPhone ||
    req.extractedFields?.contactPhone ||
    req.extractedFields?.phone ||
    "+1 (555) 019-2834";
  const callerEmail =
    req.callerEmail ||
    req.extractedFields?.workEmail ||
    req.extractedFields?.email ||
    "caller@demo.voxdesk.ai";
  const service =
    req.service ||
    req.extractedFields?.legalCategory ||
    req.extractedFields?.issueCategory ||
    req.extractedFields?.primarySymptom ||
    profile.services[0]?.name ||
    "General Consultation";
  const language = req.language || profile.defaultLanguage;

  const result: BusinessActionResult = {
    success: true,
    actionType: req.actionType,
    statusMessage: "Action executed successfully",
    recordIds: {},
    details: {},
  };

  try {
    switch (req.actionType) {
      case "checkAvailability": {
        const slots = profile.appointmentSettings.sampleSlots;
        result.statusMessage = `Found ${slots.length} available slots for ${profile.name}`;
        result.details = {
          availableSlots: slots,
          slotDuration: `${profile.appointmentSettings.slotDurationMinutes} mins`,
        };
        break;
      }

      case "reserveAppointment": {
        const startTime = req.appointmentTime
          ? new Date(req.appointmentTime)
          : new Date(Date.now() + 86400000 * 2);
        const endTime = new Date(
          startTime.getTime() +
            profile.appointmentSettings.slotDurationMinutes * 60000,
        );

        let apptId = `appt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        try {
          const appt = await prisma.appointment.create({
            data: {
              workspaceId,
              callerName,
              callerContactEncrypted: callerPhone,
              service,
              startTime,
              endTime,
              timezone: profile.timeZone,
              status: "CONFIRMED",
              confirmationStatus: "CONFIRMED",
            },
          });
          apptId = appt.id;
        } catch {
          // Fallback demo record if DB is not attached locally
        }

        result.recordIds.appointmentId = apptId;
        result.statusMessage = `Appointment confirmed for ${callerName} on ${startTime.toLocaleString()}`;
        result.details = {
          appointmentId: apptId,
          service,
          startTime,
          endTime,
          timezone: profile.timeZone,
        };
        break;
      }

      case "scoreLead":
      case "createLead": {
        const qual = calculateLeadQualification(
          {
            serviceInterest: service,
            budgetRange:
              req.extractedFields?.budgetRange ||
              req.extractedFields?.priceBudget ||
              req.extractedFields?.estimatedBudget,
            timeline:
              req.extractedFields?.timeline ||
              req.extractedFields?.buyingTimeline,
            authority: req.extractedFields?.authority,
            urgency:
              req.extractedFields?.urgencyLevel ||
              req.extractedFields?.isEmergency,
            extractedFields: req.extractedFields,
          },
          profile,
        );

        let leadId = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        try {
          const lead = await prisma.lead.create({
            data: {
              workspaceId,
              name: callerName,
              phoneEncrypted: callerPhone,
              emailEncrypted: callerEmail,
              company:
                req.company ||
                req.extractedFields?.companyName ||
                "Demo Prospect",
              serviceInterest: service,
              score: qual.score,
              category: qual.category,
              status: "NEW",
            },
          });
          leadId = lead.id;
        } catch {
          // Store fallback ID
        }

        result.recordIds.leadId = leadId;
        result.statusMessage = `Lead created with Score ${qual.score}/100 (${qual.category})`;
        result.details = {
          leadId,
          score: qual.score,
          category: qual.category,
          recommendedAction: qual.recommendedAction,
          breakdown: qual.breakdown,
          missingFields: qual.missingFields,
          followUpPriority: qual.followUpPriority,
        };
        break;
      }

      case "prepareHandoff":
      case "requestHumanReview": {
        result.statusMessage = `Escalation handoff prepared for ${profile.escalationDestination.department}`;
        result.details = {
          destination: profile.escalationDestination,
          callerName,
          callerPhone,
          service,
          reason:
            req.extractedFields?.reason ||
            "Urgent caller request / regulatory review trigger",
          urgency: "HIGH",
          summary:
            req.transcriptText ||
            "Caller requested immediate human representative assistance.",
        };
        break;
      }

      default: {
        result.statusMessage = `Executed ${req.actionType} for ${profile.name}`;
        result.details = {
          action: req.actionType,
          timestamp: new Date().toISOString(),
        };
        break;
      }
    }
  } catch (error: any) {
    result.success = false;
    result.statusMessage = `Action error: ${error?.message || "Execution failed"}`;
  }

  return result;
}
