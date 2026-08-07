import 'server-only';
import { z } from 'zod';

export const CloudflareStructuredOutputSchema = z.object({
  spokenReply: z.string().min(1),
  intent: z.enum(['BOOKING', 'QUALIFICATION', 'ESCALATION', 'ROUTINE', 'UNKNOWN']),
  suggestedState: z.string(),
  extractedFields: z.object({
    name: z.string().nullable().optional(),
    service: z.string().nullable().optional(),
    preferredDate: z.string().nullable().optional(),
    preferredTime: z.string().nullable().optional(),
    budget: z.string().nullable().optional(),
    timeline: z.string().nullable().optional(),
    authority: z.string().nullable().optional(),
    urgency: z.string().nullable().optional(),
  }),
  suggestedAction: z.enum([
    'NONE',
    'CHECK_DEMO_CALENDAR',
    'CONFIRM_DEMO_APPOINTMENT',
    'SCORE_LEAD',
    'PREPARE_HANDOFF',
    'COMPLETE',
  ]),
  confidence: z.number().min(0).max(1).default(0.9),
  requiresHumanReview: z.boolean().default(false),
});

export type CloudflareStructuredOutput = z.infer<typeof CloudflareStructuredOutputSchema>;
