import { BusinessActionType } from "./schemas/voice-agent-output";
import { OrganizationProfile } from "@/lib/organization/types";

export interface PendingConfirmation {
  actionType: "RESERVE_APPOINTMENT";
  payload: {
    startTime: string;
    endTime: string;
    service: string;
  };
  createdAt: number;
  expiresAt: number;
}

export type ActionDecision =
  | { execute: true; action: BusinessActionType }
  | { execute: false; reason: string }
  | { execute: false; pendingConfirmation: PendingConfirmation };

export interface ActionPolicyContext {
  suggestedAction: BusinessActionType;
  state: string;
  scenario: string;
  accumulatedFields: Record<string, any>;
  pendingConfirmation?: PendingConfirmation;
  userMessage: string;
  profile: OrganizationProfile;
  executedActions?: string[];
}

export function evaluateSuggestedAction(
  ctx: ActionPolicyContext,
): ActionDecision {
  const {
    suggestedAction,
    state,
    scenario,
    accumulatedFields,
    pendingConfirmation,
    userMessage,
    profile,
    executedActions = [],
  } = ctx;

  if (suggestedAction === "NONE") {
    return {
      execute: false,
      reason: "Model suggested no business action (NONE).",
    };
  }

  if (suggestedAction === "ANSWER_APPROVED_QUESTION") {
    return { execute: true, action: "ANSWER_APPROVED_QUESTION" };
  }

  if (
    suggestedAction === "PREPARE_HANDOFF" ||
    suggestedAction === "REQUEST_HUMAN_REVIEW"
  ) {
    return { execute: true, action: suggestedAction };
  }

  // Routine scenario policy: Never create sales lead or reserve appointment automatically for FAQ
  if (
    scenario === "ROUTINE" &&
    (suggestedAction === "CREATE_LEAD" || suggestedAction === "SCORE_LEAD")
  ) {
    return {
      execute: false,
      reason: "Routine FAQ scenario prohibits sales lead creation.",
    };
  }

  // Reserve appointment policy: Requires explicit caller confirmation and valid slots
  if (suggestedAction === "RESERVE_APPOINTMENT") {
    const isExplicitConfirmation =
      /yes|yeah|sure|confirm|book that|that works|perfect/i.test(userMessage);

    if (!isExplicitConfirmation && !pendingConfirmation) {
      const startTime = new Date(Date.now() + 86400000 * 2).toISOString();
      const endTime = new Date(
        Date.now() + 86400000 * 2 + 1800000,
      ).toISOString();

      return {
        execute: false,
        pendingConfirmation: {
          actionType: "RESERVE_APPOINTMENT",
          payload: {
            startTime,
            endTime,
            service:
              accumulatedFields.serviceInterest ||
              profile.services[0]?.name ||
              "Consultation",
          },
          createdAt: Date.now(),
          expiresAt: Date.now() + 600000,
        },
      };
    }

    if (executedActions.includes("RESERVE_APPOINTMENT")) {
      return {
        execute: false,
        reason:
          "Appointment reservation has already been executed for session.",
      };
    }

    return { execute: true, action: "RESERVE_APPOINTMENT" };
  }

  // Lead creation policy: Requires minimum contact name/phone or explicit qualification scenario
  if (suggestedAction === "CREATE_LEAD" || suggestedAction === "SCORE_LEAD") {
    const hasNameOrContact =
      accumulatedFields.fullName ||
      accumulatedFields.customerName ||
      accumulatedFields.contactPhone ||
      accumulatedFields.phone;

    if (!hasNameOrContact && scenario !== "QUALIFICATION") {
      return {
        execute: false,
        reason: "Insufficient contact information for lead creation.",
      };
    }

    if (executedActions.includes(suggestedAction)) {
      return {
        execute: false,
        reason: `${suggestedAction} already executed for session.`,
      };
    }

    return { execute: true, action: suggestedAction };
  }

  return { execute: true, action: suggestedAction };
}
