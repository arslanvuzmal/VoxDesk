import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrganizationProfile } from "@/lib/organization/registry";
import { legalTrainingPack } from "@/lib/organization/presets/legal";
import { generateRealAvailableSlots } from "@/lib/conversation/availability";
import { persistFinalCallResult } from "@/lib/database/persistence";

const ToolExecutionSchema = z.object({
  sessionId: z.string().optional(),
  businessId: z.string().optional().default("biz-northstar-legal"),
  presetKey: z.string().optional().default("LEGAL"),
  parameters: z.record(z.unknown()).optional().default({}),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ toolName: string }> },
) {
  const { toolName } = await params;
  const correlationId = `tool_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
  const startedAt = Date.now();

  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = ToolExecutionSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid tool execution parameters.",
          details: parseResult.error.flatten(),
          correlationId,
        },
        { status: 400 },
      );
    }

    const { presetKey, parameters } = parseResult.data;
    const profile = getOrganizationProfile(presetKey);

    let resultPayload: any = {};

    switch (toolName) {
      case "get_business_information": {
        resultPayload = {
          businessName: profile.name,
          industry: profile.industry,
          workingHours: profile.workingHours,
          location: "500 Fifth Avenue, Suite 2400, New York, NY 10110",
          primaryPhone: legalTrainingPack.business.primaryPhone,
          services: profile.services,
          disclaimer: profile.complianceDisclaimer["en-US"],
        };
        break;
      }

      case "check_availability": {
        const slots = generateRealAvailableSlots(presetKey);
        resultPayload = {
          available: true,
          slotsCount: slots.length,
          slots: slots.map((s) => ({
            slotId: s.slotId,
            formattedDate: s.formattedDate,
            startTime: s.startTime,
            endTime: s.endTime,
            timezone: s.timezone,
          })),
        };
        break;
      }

      case "hold_appointment_slot": {
        const slotId =
          (parameters.slotId as string) || `slot_legal_1_${Date.now()}`;
        const realSlots = generateRealAvailableSlots(presetKey);
        const selectedSlot = realSlots[0];

        resultPayload = {
          held: true,
          holdId: `hold_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          slotId,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          formattedDate: selectedSlot.formattedDate,
          expiresInSeconds: 600,
        };
        break;
      }

      case "confirm_appointment": {
        const callerName =
          (parameters.callerName as string) ||
          (parameters.fullName as string) ||
          "Valued Caller";
        const contactPhone =
          (parameters.contactPhone as string) ||
          (parameters.phone as string) ||
          "+15550192834";
        const slotId =
          (parameters.slotId as string) || `slot_legal_1_${Date.now()}`;
        const realSlots = generateRealAvailableSlots(presetKey);
        const selectedSlot = realSlots[0];

        const appointmentId = `appt_${Date.now()}_${Math.random().toString(36).slice(2)}`;

        resultPayload = {
          confirmed: true,
          appointmentId,
          callerName,
          service: selectedSlot.serviceName,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          formattedDate: selectedSlot.formattedDate,
          status: "CONFIRMED",
        };
        break;
      }

      case "create_or_update_lead": {
        const callerName =
          (parameters.fullName as string) ||
          (parameters.callerName as string) ||
          "Prospective Client";
        const leadId = `lead_${Date.now()}_${Math.random().toString(36).slice(2)}`;

        resultPayload = {
          created: true,
          leadId,
          name: callerName,
          category: parameters.score
            ? Number(parameters.score) >= 75
              ? "HOT"
              : "WARM"
            : "WARM",
          status: "NEW",
        };
        break;
      }

      case "prepare_follow_up": {
        resultPayload = {
          followUpScheduled: true,
          recommendedTimeframe: "Within 2 business hours",
          summary:
            (parameters.summary as string) ||
            "Follow up regarding legal intake consultation.",
        };
        break;
      }

      case "prepare_human_handoff": {
        const handoffId = `handoff_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        resultPayload = {
          handoffPrepared: true,
          handoffId,
          destinationDepartment:
            legalTrainingPack.escalationPolicy.destinationDepartment,
          urgency: (parameters.urgency as string) || "CRITICAL",
          status: "PREPARED",
          callbackMessage:
            "I’ve prepared an urgent callback request for the on-call team.",
        };
        break;
      }

      case "record_unanswered_question": {
        resultPayload = {
          recorded: true,
          question:
            (parameters.question as string) || "Unanswered customer inquiry",
          status: "LOGGED_FOR_FOLLOWUP",
        };
        break;
      }

      case "complete_call": {
        resultPayload = {
          completed: true,
          summary:
            (parameters.summary as string) || "Call completed successfully.",
        };
        break;
      }

      default: {
        return NextResponse.json(
          {
            success: false,
            error: `Unknown tool '${toolName}'.`,
            correlationId,
          },
          { status: 404 },
        );
      }
    }

    const latencyMs = Date.now() - startedAt;

    return NextResponse.json({
      success: true,
      toolName,
      latencyMs,
      result: resultPayload,
      correlationId,
    });
  } catch (error: any) {
    console.error(
      `[TOOL EXECUTION ERROR] tool=${toolName} correlationId=${correlationId}:`,
      error,
    );
    return NextResponse.json(
      {
        success: false,
        error: `Tool execution for '${toolName}' failed.`,
        code: "TOOL_EXECUTION_FAILED",
        correlationId,
      },
      { status: 500 },
    );
  }
}
