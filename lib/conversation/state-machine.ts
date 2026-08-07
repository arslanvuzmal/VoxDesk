import { ConversationState } from './schemas/voice-agent-output';

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  INITIALISING: ['READY', 'GREETING', 'IDENTIFYING_INTENT'],
  READY: ['GREETING', 'IDENTIFYING_INTENT', 'COLLECTING_CONTACT'],
  GREETING: ['IDENTIFYING_INTENT', 'COLLECTING_CONTACT', 'ANSWERING_ROUTINE', 'FAILED'],
  IDENTIFYING_INTENT: [
    'COLLECTING_CONTACT',
    'COLLECTING_REQUIREMENTS',
    'QUALIFYING',
    'CHECKING_AVAILABILITY',
    'PREPARING_HANDOFF',
    'ANSWERING_ROUTINE',
    'FAILED',
  ],
  COLLECTING_CONTACT: [
    'COLLECTING_REQUIREMENTS',
    'QUALIFYING',
    'CHECKING_AVAILABILITY',
    'PREPARING_HANDOFF',
    'ANSWERING_ROUTINE',
    'FAILED',
  ],
  COLLECTING_REQUIREMENTS: [
    'QUALIFYING',
    'CHECKING_AVAILABILITY',
    'OFFERING_SLOTS',
    'PREPARING_HANDOFF',
    'ANSWERING_ROUTINE',
    'FAILED',
  ],
  QUALIFYING: [
    'CHECKING_AVAILABILITY',
    'OFFERING_SLOTS',
    'AWAITING_CONFIRMATION',
    'PREPARING_HANDOFF',
    'WRAPUP',
    'COMPLETED',
    'FAILED',
  ],
  CHECKING_AVAILABILITY: [
    'OFFERING_SLOTS',
    'AWAITING_CONFIRMATION',
    'BOOKING',
    'PREPARING_HANDOFF',
    'FAILED',
  ],
  OFFERING_SLOTS: ['AWAITING_CONFIRMATION', 'BOOKING', 'CHECKING_AVAILABILITY', 'FAILED'],
  AWAITING_CONFIRMATION: ['BOOKING', 'OFFERING_SLOTS', 'PREPARING_HANDOFF', 'WRAPUP', 'FAILED'],
  BOOKING: ['WRAPUP', 'COMPLETED', 'FAILED'],
  PREPARING_HANDOFF: ['WRAPUP', 'COMPLETED', 'FAILED'],
  ANSWERING_ROUTINE: [
    'IDENTIFYING_INTENT',
    'COLLECTING_REQUIREMENTS',
    'CHECKING_AVAILABILITY',
    'WRAPUP',
    'COMPLETED',
    'FAILED',
  ],
  WRAPUP: ['COMPLETED', 'FAILED'],
  COMPLETED: [],
  FAILED: [],
};

export function validateStateTransition(
  currentState: ConversationState,
  proposedState: ConversationState
): ConversationState {
  if (currentState === proposedState) return currentState;

  const allowed = ALLOWED_TRANSITIONS[currentState] || [];
  if (allowed.includes(proposedState)) {
    return proposedState;
  }

  return currentState;
}

export class ConversationStateMachine {
  private currentState: string;

  constructor(initialState: string = 'GREETING') {
    this.currentState = initialState;
  }

  public getState(): string {
    return this.currentState;
  }

  public transition(targetState: string): string {
    if (targetState === this.currentState) return this.currentState;
    const allowed = ALLOWED_TRANSITIONS[this.currentState] || [];
    if (!allowed.includes(targetState)) {
      throw new Error(`Illegal transition from '${this.currentState}' to '${targetState}'`);
    }
    this.currentState = targetState;
    return this.currentState;
  }
}
