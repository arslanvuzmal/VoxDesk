import { z } from 'zod';

export const SupportedLanguageSchema = z.enum(['en-US', 'ur-PK', 'es-ES']);
export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const DemoIntentSchema = z.enum([
  'BOOKING',
  'QUALIFICATION',
  'ESCALATION',
  'ROUTINE',
  'UNKNOWN',
]);
export type DemoIntent = z.infer<typeof DemoIntentSchema>;

export const ConversationStateSchema = z.enum([
  'GREETING',
  'IDENTIFYING_INTENT',
  'COLLECTING_CONTACT',
  'COLLECTING_REQUIREMENTS',
  'QUALIFYING',
  'CHECKING_AVAILABILITY',
  'OFFERING_SLOTS',
  'AWAITING_CONFIRMATION',
  'BOOKING',
  'PREPARING_HANDOFF',
  'ANSWERING_ROUTINE',
  'WRAPUP',
  'COMPLETED',
  'FAILED',
]);
export type ConversationState = z.infer<typeof ConversationStateSchema>;

export const BusinessActionTypeSchema = z.enum([
  'NONE',
  'CHECK_AVAILABILITY',
  'RESERVE_APPOINTMENT',
  'SCORE_LEAD',
  'CREATE_LEAD',
  'UPDATE_LEAD',
  'PREPARE_FOLLOW_UP',
  'PREPARE_HANDOFF',
  'ANSWER_APPROVED_QUESTION',
  'REQUEST_HUMAN_REVIEW',
  'COMPLETE_CALL',
]);
export type BusinessActionType = z.infer<typeof BusinessActionTypeSchema>;

export const VoiceAgentOutputSchema = z.object({
  spokenReply: z.string().min(1).max(500),
  detectedLanguage: SupportedLanguageSchema,
  intent: DemoIntentSchema,
  secondaryIntent: z.string().nullable().default(null),
  suggestedState: ConversationStateSchema,
  sentiment: z.enum(['positive', 'neutral', 'negative', 'concerned']),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  confidence: z.number().min(0).max(1),
  extractedFields: z.record(z.unknown()),
  missingRequiredFields: z.array(z.string()),
  suggestedAction: BusinessActionTypeSchema,
  requiresHumanReview: z.boolean(),
  handoffReason: z.string().nullable(),
  knowledgeReferences: z.array(z.string()),
  nextBestQuestion: z.string().nullable(),
  shouldEnd: z.boolean(),
});

export type VoiceAgentOutput = z.infer<typeof VoiceAgentOutputSchema>;
