export interface DemoScenario {
  id: string;
  title: string;
  category: 'booking' | 'qualification' | 'escalation' | 'edge_case' | 'story';
  description: string;
  callerName: string;
  callerNumber: string;
  initialUtterance: string;
  expectedStateSequence: string[];
  expectedOutcome: string;
  dialogueScript: {
    speaker: 'caller' | 'agent';
    text: string;
    state: string;
  }[];
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'scenario-01-booking',
    title: '1. Successful Appointment Booking',
    category: 'booking',
    description:
      'Caller requests a consultation for next Tuesday, answers service questions, selects a slot, and confirms.',
    callerName: 'Sarah Miller',
    callerNumber: '+1 (555) 019-2834',
    initialUtterance: 'Hi, I need to book a legal consultation next Tuesday afternoon.',
    expectedStateSequence: [
      'GREETING',
      'IDENTIFYING_INTENT',
      'COLLECTING_CONTACT',
      'CHECKING_AVAILABILITY',
      'OFFERING_SLOTS',
      'CONFIRMING_APPOINTMENT',
      'CLOSING',
    ],
    expectedOutcome: 'APPOINTMENT_SCHEDULED',
    dialogueScript: [
      {
        speaker: 'agent',
        text: 'Thank you for calling Northstar Legal Consultations. My name is Maya. How can I help you today?',
        state: 'GREETING',
      },
      {
        speaker: 'caller',
        text: 'Hi, I need to book a legal consultation next Tuesday afternoon.',
        state: 'IDENTIFYING_INTENT',
      },
      {
        speaker: 'agent',
        text: "I'd be glad to help you schedule that. May I have your full name and the best email to send confirmation details to?",
        state: 'COLLECTING_CONTACT',
      },
      {
        speaker: 'caller',
        text: 'My name is Sarah Miller and my email is sarah.miller@example.com.',
        state: 'COLLECTING_CONTACT',
      },
      {
        speaker: 'agent',
        text: 'Thank you, Sarah. Checking our calendar for next Tuesday... We have openings at 2:00 PM EST and 3:30 PM EST. Which works better for you?',
        state: 'OFFERING_SLOTS',
      },
      {
        speaker: 'caller',
        text: '2:00 PM EST works perfectly for me.',
        state: 'CONFIRMING_APPOINTMENT',
      },
      {
        speaker: 'agent',
        text: 'Excellent! I have confirmed your Legal Consultation for next Tuesday at 2:00 PM EST. A confirmation email has been dispatched. Have a wonderful day!',
        state: 'CLOSING',
      },
    ],
  },
  {
    id: 'scenario-02-reschedule',
    title: '2. Appointment Rescheduling',
    category: 'booking',
    description: 'Caller wants to move an existing appointment to a later date.',
    callerName: 'Daniel Brooks',
    callerNumber: '+1 (555) 014-9921',
    initialUtterance:
      'Hi, I have an appointment scheduled for tomorrow and I need to reschedule it.',
    expectedStateSequence: [
      'GREETING',
      'IDENTIFYING_INTENT',
      'RESCHEDULING',
      'CHECKING_AVAILABILITY',
      'OFFERING_SLOTS',
      'CONFIRMING_APPOINTMENT',
      'CLOSING',
    ],
    expectedOutcome: 'APPOINTMENT_RESCHEDULED',
    dialogueScript: [
      {
        speaker: 'agent',
        text: 'Thank you for calling Northstar Legal. How can I assist you?',
        state: 'GREETING',
      },
      {
        speaker: 'caller',
        text: 'I need to reschedule my consultation scheduled for tomorrow.',
        state: 'RESCHEDULING',
      },
      {
        speaker: 'agent',
        text: 'Certainly Daniel. I found your booking for tomorrow at 10:00 AM. We have openings this Thursday at 11:00 AM or Friday at 2:00 PM.',
        state: 'OFFERING_SLOTS',
      },
      {
        speaker: 'caller',
        text: 'Thursday at 11:00 AM works better.',
        state: 'CONFIRMING_APPOINTMENT',
      },
      {
        speaker: 'agent',
        text: 'Done! Your consultation has been rescheduled to Thursday at 11:00 AM EST.',
        state: 'CLOSING',
      },
    ],
  },
  {
    id: 'scenario-04-hot-lead',
    title: '4. Hot Sales Lead Qualification',
    category: 'qualification',
    description: 'High-budget commercial client seeking immediate legal representation.',
    callerName: 'Priya Shah',
    callerNumber: '+1 (555) 018-4490',
    initialUtterance:
      'We are acquiring a real estate asset next month and need corporate legal counsel immediately. Our legal budget is over $25,000.',
    expectedStateSequence: [
      'GREETING',
      'IDENTIFYING_INTENT',
      'QUALIFYING_LEAD',
      'CHECKING_AVAILABILITY',
      'CONFIRMING_APPOINTMENT',
      'CLOSING',
    ],
    expectedOutcome: 'LEAD_QUALIFIED',
    dialogueScript: [
      {
        speaker: 'agent',
        text: 'Thank you for calling Northstar Legal. How can we assist your business?',
        state: 'GREETING',
      },
      {
        speaker: 'caller',
        text: 'We are acquiring a real estate portfolio next month and need corporate legal counsel. Budget is around $25,000.',
        state: 'QUALIFYING_LEAD',
      },
      {
        speaker: 'agent',
        text: 'Thank you Priya. Are you the primary decision maker for signing the engagement?',
        state: 'QUALIFYING_LEAD',
      },
      {
        speaker: 'caller',
        text: 'Yes, I am the Managing Director.',
        state: 'QUALIFYING_LEAD',
      },
      {
        speaker: 'agent',
        text: 'Understood. Based on your high priority commercial requirement, I have classified your file as HOT and reserved an immediate partner consultation slot.',
        state: 'CLOSING',
      },
    ],
  },
  {
    id: 'scenario-08-escalation',
    title: '8. Human Operator Escalation',
    category: 'escalation',
    description: 'Caller requests an immediate human transfer for urgent legal matter.',
    callerName: 'Michael Chen',
    callerNumber: '+1 (555) 012-7788',
    initialUtterance: 'I need to speak to a human lawyer right now. It is an urgent court notice.',
    expectedStateSequence: ['GREETING', 'IDENTIFYING_INTENT', 'ESCALATING', 'CLOSING'],
    expectedOutcome: 'ESCALATED_HUMAN',
    dialogueScript: [
      {
        speaker: 'agent',
        text: 'Northstar Legal Consultations, how can I direct your call?',
        state: 'GREETING',
      },
      {
        speaker: 'caller',
        text: 'I need to speak to a real person immediately regarding an urgent court filing.',
        state: 'ESCALATING',
      },
      {
        speaker: 'agent',
        text: 'I understand the urgency Michael. I am transferring your call to our duty attorney queue right now with a full context summary.',
        state: 'CLOSING',
      },
    ],
  },
  {
    id: 'scenario-22-story',
    title: '22. Complete Guided Client Story (1-Min Demo)',
    category: 'story',
    description: 'Comprehensive 10-step client journey demonstrating full platform capabilities.',
    callerName: 'Sarah Miller',
    callerNumber: '+1 (555) 019-2834',
    initialUtterance: 'Hi! I was referred to Northstar Legal for a contract consultation.',
    expectedStateSequence: [
      'GREETING',
      'IDENTIFYING_INTENT',
      'ANSWERING_QUESTION',
      'COLLECTING_CONTACT',
      'QUALIFYING_LEAD',
      'CHECKING_AVAILABILITY',
      'OFFERING_SLOTS',
      'CONFIRMING_APPOINTMENT',
      'SUMMARISING',
      'CLOSING',
    ],
    expectedOutcome: 'APPOINTMENT_SCHEDULED',
    dialogueScript: [
      {
        speaker: 'agent',
        text: "Welcome to Northstar Legal Consultations! I'm Maya, your AI receptionist. How can I assist you today?",
        state: 'GREETING',
      },
      {
        speaker: 'caller',
        text: 'Hi Maya! I need help reviewing a commercial contract and booking a consultation.',
        state: 'IDENTIFYING_INTENT',
      },
      {
        speaker: 'agent',
        text: 'We specialize in commercial contract reviews! What is your estimated timeline for the review?',
        state: 'QUALIFYING_LEAD',
      },
      {
        speaker: 'caller',
        text: 'We need it completed by the end of next week.',
        state: 'QUALIFYING_LEAD',
      },
      {
        speaker: 'agent',
        text: 'Perfect. Checking calendar availability for our contract team... We have Tuesday at 2:00 PM EST available. Shall I book that for you?',
        state: 'OFFERING_SLOTS',
      },
      {
        speaker: 'caller',
        text: 'Yes please, book Tuesday at 2:00 PM EST.',
        state: 'CONFIRMING_APPOINTMENT',
      },
      {
        speaker: 'agent',
        text: 'Your consultation is confirmed for Tuesday at 2:00 PM EST. Contact details and CRM records have been updated!',
        state: 'CLOSING',
      },
    ],
  },
];
