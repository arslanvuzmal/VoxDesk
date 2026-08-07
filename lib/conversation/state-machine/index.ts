export type ConversationState =
  | 'INITIALISING'
  | 'GREETING'
  | 'IDENTIFYING_INTENT'
  | 'ANSWERING_QUESTION'
  | 'COLLECTING_CONTACT'
  | 'QUALIFYING_LEAD'
  | 'CHECKING_AVAILABILITY'
  | 'OFFERING_SLOTS'
  | 'CONFIRMING_APPOINTMENT'
  | 'RESCHEDULING'
  | 'CANCELLING'
  | 'ESCALATING'
  | 'SUMMARISING'
  | 'CLOSING'
  | 'COMPLETED'
  | 'FAILED';

export interface StateConfig {
  purpose: string;
  allowedNextStates: ConversationState[];
  requiredFields: string[];
  maxTurns: number;
}

export const STATE_CONFIGS: Record<ConversationState, StateConfig> = {
  INITIALISING: {
    purpose: 'Initialize call context, business profile, and agent settings',
    allowedNextStates: ['GREETING', 'FAILED'],
    requiredFields: [],
    maxTurns: 1,
  },
  GREETING: {
    purpose: 'Speak agent custom greeting and prompt caller for intent',
    allowedNextStates: ['IDENTIFYING_INTENT', 'ESCALATING', 'FAILED'],
    requiredFields: [],
    maxTurns: 2,
  },
  IDENTIFYING_INTENT: {
    purpose: 'Parse caller utterance to identify core goal',
    allowedNextStates: [
      'ANSWERING_QUESTION',
      'COLLECTING_CONTACT',
      'QUALIFYING_LEAD',
      'CHECKING_AVAILABILITY',
      'RESCHEDULING',
      'CANCELLING',
      'ESCALATING',
      'CLOSING',
    ],
    requiredFields: [],
    maxTurns: 3,
  },
  ANSWERING_QUESTION: {
    purpose: 'Answer business question using approved Q&A knowledge base',
    allowedNextStates: [
      'IDENTIFYING_INTENT',
      'COLLECTING_CONTACT',
      'CHECKING_AVAILABILITY',
      'ESCALATING',
      'CLOSING',
    ],
    requiredFields: [],
    maxTurns: 3,
  },
  COLLECTING_CONTACT: {
    purpose: 'Collect caller name and contact phone/email',
    allowedNextStates: ['QUALIFYING_LEAD', 'CHECKING_AVAILABILITY', 'ESCALATING', 'CLOSING'],
    requiredFields: ['callerName'],
    maxTurns: 4,
  },
  QUALIFYING_LEAD: {
    purpose: 'Collect service interest, budget, timeline, and decision authority',
    allowedNextStates: ['CHECKING_AVAILABILITY', 'ESCALATING', 'CLOSING'],
    requiredFields: ['serviceInterest'],
    maxTurns: 5,
  },
  CHECKING_AVAILABILITY: {
    purpose: 'Query calendar provider for valid free slots',
    allowedNextStates: ['OFFERING_SLOTS', 'ESCALATING', 'CLOSING'],
    requiredFields: ['serviceInterest'],
    maxTurns: 2,
  },
  OFFERING_SLOTS: {
    purpose: 'Present 2 available appointment slots to the caller',
    allowedNextStates: ['CONFIRMING_APPOINTMENT', 'OFFERING_SLOTS', 'ESCALATING', 'CLOSING'],
    requiredFields: [],
    maxTurns: 3,
  },
  CONFIRMING_APPOINTMENT: {
    purpose: 'Obtain explicit confirmation from caller for target slot',
    allowedNextStates: ['SUMMARISING', 'OFFERING_SLOTS', 'ESCALATING', 'CLOSING'],
    requiredFields: ['selectedSlot'],
    maxTurns: 2,
  },
  RESCHEDULING: {
    purpose: 'Locate existing appointment and offer new available slots',
    allowedNextStates: ['CHECKING_AVAILABILITY', 'ESCALATING', 'CLOSING'],
    requiredFields: [],
    maxTurns: 3,
  },
  CANCELLING: {
    purpose: 'Confirm and process appointment cancellation',
    allowedNextStates: ['SUMMARISING', 'ESCALATING', 'CLOSING'],
    requiredFields: [],
    maxTurns: 2,
  },
  ESCALATING: {
    purpose: 'Trigger human transfer or create priority callback task',
    allowedNextStates: ['CLOSING', 'FAILED'],
    requiredFields: [],
    maxTurns: 2,
  },
  SUMMARISING: {
    purpose: 'Persist transcript, compute qualification score, sync CRM',
    allowedNextStates: ['CLOSING'],
    requiredFields: [],
    maxTurns: 1,
  },
  CLOSING: {
    purpose: 'Deliver closing sign-off and disconnect call gracefully',
    allowedNextStates: ['COMPLETED'],
    requiredFields: [],
    maxTurns: 1,
  },
  COMPLETED: {
    purpose: 'Call session ended successfully',
    allowedNextStates: [],
    requiredFields: [],
    maxTurns: 0,
  },
  FAILED: {
    purpose: 'Call session terminated due to provider error or timeout',
    allowedNextStates: [],
    requiredFields: [],
    maxTurns: 0,
  },
};

export class ConversationStateMachine {
  private currentState: ConversationState = 'INITIALISING';
  private turnsInState: number = 0;

  constructor(initialState: ConversationState = 'INITIALISING') {
    this.currentState = initialState;
  }

  public getState(): ConversationState {
    return this.currentState;
  }

  public canTransitionTo(nextState: ConversationState): boolean {
    const config = STATE_CONFIGS[this.currentState];
    return config.allowedNextStates.includes(nextState);
  }

  public transition(nextState: ConversationState): ConversationState {
    if (!this.canTransitionTo(nextState)) {
      throw new Error(`Invalid state transition from '${this.currentState}' to '${nextState}'`);
    }
    this.currentState = nextState;
    this.turnsInState = 0;
    return this.currentState;
  }

  public incrementTurn(): void {
    this.turnsInState += 1;
    const config = STATE_CONFIGS[this.currentState];
    if (config.maxTurns > 0 && this.turnsInState >= config.maxTurns) {
      // Auto-advance if max turns exceeded
      if (this.canTransitionTo('ESCALATING')) {
        this.transition('ESCALATING');
      }
    }
  }
}
