import { z } from 'zod';

export const CallSummarySchema = z.object({
  intent: z.string(),
  summary: z.string(),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  leadQualification: z.object({
    score: z.number(),
    category: z.enum(['HOT', 'WARM', 'REVIEW', 'COLD']),
    reason: z.string(),
  }),
  appointment: z.object({
    status: z.string(),
    time: z.string().optional(),
    timezone: z.string().optional(),
  }),
  actionItems: z.array(z.string()),
  commitments: z.array(z.string()),
  followUpRecommendation: z.string().optional(),
});

export type CallSummaryData = z.infer<typeof CallSummarySchema>;

export function generateStructuredSummary(
  transcript: { speaker: string; text: string }[],
  qualScore: number = 75,
  appointmentBooked: boolean = false
): CallSummaryData {
  const fullText = transcript.map(t => `${t.speaker}: ${t.text}`).join('\n');

  const isAppointmentRequest =
    fullText.toLowerCase().includes('book') ||
    fullText.toLowerCase().includes('schedule') ||
    appointmentBooked;
  const isEscalated =
    fullText.toLowerCase().includes('transfer') || fullText.toLowerCase().includes('human');

  const intent = isAppointmentRequest
    ? 'Schedule Consultation Appointment'
    : isEscalated
      ? 'Human Operator Transfer Request'
      : 'General Business Enquiry';

  const actionItems: string[] = [];
  const commitments: string[] = [];

  if (appointmentBooked) {
    commitments.push('Confirmation email dispatched to caller');
    actionItems.push('Verify calendar event synchronization prior to appointment');
  } else {
    actionItems.push('Follow up with caller within 24 hours regarding requested service');
  }

  return {
    intent,
    summary: `Caller contacted Northstar Legal regarding legal consultation services. Agent answered business questions, evaluated qualification metrics, and ${
      appointmentBooked
        ? 'successfully booked a consultation slot.'
        : 'provided information for operator review.'
    }`,
    sentiment: 'positive',
    urgency: qualScore >= 75 ? 'high' : 'medium',
    leadQualification: {
      score: qualScore,
      category: qualScore >= 75 ? 'HOT' : qualScore >= 50 ? 'WARM' : 'REVIEW',
      reason:
        qualScore >= 75
          ? 'High budget and immediate consultation request'
          : 'Moderate service fit needing follow-up',
    },
    appointment: {
      status: appointmentBooked ? 'CONFIRMED' : 'NONE',
      time: appointmentBooked ? 'Tuesday at 2:00 PM EST' : undefined,
      timezone: 'America/New_York',
    },
    actionItems,
    commitments,
    followUpRecommendation: appointmentBooked
      ? 'Send automated SMS reminder 24 hours prior to slot.'
      : 'Assign lead to senior intake team.',
  };
}
