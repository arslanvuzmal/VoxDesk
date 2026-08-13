import { BusinessActionType } from './schemas/voice-agent-output';
import { OrganizationProfile } from '@/lib/organization/types';
import { generateRealAvailableSlots } from './availability';

export interface PendingConfirmation {
  id: string;
  actionType: 'RESERVE_APPOINTMENT';
  offeredAt: number;
  expiresAt: number;
  payload: {
    slotId: string;
    startTime: string;
    endTime: string;
    timezone: string;
    serviceId: string;
    formattedDate: string;
  };
}

export type ActionDecision =
  | {
      execute: true;
      action: BusinessActionType;
      pendingConfirmation?: PendingConfirmation;
    }
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

export function evaluateSuggestedAction(ctx: ActionPolicyContext): ActionDecision {
  const {
    suggestedAction,
    scenario,
    accumulatedFields,
    pendingConfirmation,
    userMessage,
    profile,
    executedActions = [],
  } = ctx;

  if (suggestedAction === 'NONE') {
    return {
      execute: false,
      reason: 'Model suggested no business action (NONE).',
    };
  }

  if (suggestedAction === 'ANSWER_APPROVED_QUESTION') {
    return { execute: true, action: 'ANSWER_APPROVED_QUESTION' };
  }

  if (suggestedAction === 'PREPARE_HANDOFF' || suggestedAction === 'REQUEST_HUMAN_REVIEW') {
    return { execute: true, action: suggestedAction };
  }

  // Routine scenario policy: Never create sales lead or reserve appointment automatically for FAQ
  if (
    scenario === 'ROUTINE' &&
    (suggestedAction === 'CREATE_LEAD' || suggestedAction === 'SCORE_LEAD')
  ) {
    return {
      execute: false,
      reason: 'Routine FAQ scenario prohibits sales lead creation.',
    };
  }

  // Reserve appointment policy: Requires explicit caller confirmation against real offered slot
  if (suggestedAction === 'RESERVE_APPOINTMENT') {
    if (pendingConfirmation && pendingConfirmation.expiresAt <= Date.now()) {
      return {
        execute: false,
        reason: 'The offered appointment slot expired; availability must be checked again.',
      };
    }

    const isExplicitConfirmation =
      /yes|yeah|sure|confirm|book that|that works|perfect|book it|go ahead/i.test(userMessage);

    // If caller has not explicitly confirmed an offered slot, offer real slots and create pending confirmation
    if (!isExplicitConfirmation || !pendingConfirmation) {
      const realSlots = generateRealAvailableSlots(profile.presetKey);
      const chosenSlot = realSlots[0];

      return {
        execute: false,
        pendingConfirmation: {
          id: `pending_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          actionType: 'RESERVE_APPOINTMENT',
          payload: {
            slotId: chosenSlot.slotId,
            startTime: chosenSlot.startTime,
            endTime: chosenSlot.endTime,
            timezone: chosenSlot.timezone,
            serviceId: chosenSlot.serviceId,
            formattedDate: chosenSlot.formattedDate,
          },
          offeredAt: Date.now(),
          expiresAt: Date.now() + 600000, // 10 minutes
        },
      };
    }

    if (executedActions.includes('RESERVE_APPOINTMENT')) {
      return {
        execute: false,
        reason: 'Appointment reservation has already been executed for session.',
      };
    }

    return {
      execute: true,
      action: 'RESERVE_APPOINTMENT',
      pendingConfirmation,
    };
  }

  // Lead creation policy: Requires minimum contact name/phone or explicit qualification scenario
  if (suggestedAction === 'CREATE_LEAD' || suggestedAction === 'SCORE_LEAD') {
    const sensitiveFieldPresent = Object.keys(accumulatedFields).some(key =>
      /payment|card|bank|password|ssn|social.?security|medical.?record/i.test(key)
    );
    if (sensitiveFieldPresent) {
      return {
        execute: false,
        reason: 'Sensitive fields require human review before lead creation.',
      };
    }

    const hasNameOrContact =
      accumulatedFields.fullName ||
      accumulatedFields.customerName ||
      accumulatedFields.contactPhone ||
      accumulatedFields.phone;

    if (!hasNameOrContact && scenario !== 'QUALIFICATION') {
      return {
        execute: false,
        reason: 'Insufficient contact information for lead creation.',
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
