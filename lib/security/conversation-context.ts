import 'server-only';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '@/lib/config/env';

const ConversationContextSchema = z.object({
  conversationId: z.string().min(1),
  workspaceId: z.string().min(1),
  businessId: z.string().min(1),
  contactId: z.string().min(1).nullable(),
  agentId: z.string().min(1),
  agentVersionId: z.string().min(1),
  trainingPackVersionId: z.string().min(1),
  channel: z.enum(['WEB_VOICE', 'PHONE', 'WEB_TEXT']),
  direction: z.enum(['INBOUND', 'OUTBOUND', 'INTERACTIVE']),
  language: z.string().min(2).max(35),
});

export type ConversationContext = z.infer<typeof ConversationContextSchema>;

export function signConversationContext(context: ConversationContext, ttlSeconds = 300): string {
  const validated = ConversationContextSchema.parse(context);
  return jwt.sign(validated, env.INTERNAL_API_SECRET, {
    algorithm: 'HS256',
    expiresIn: ttlSeconds,
    issuer: 'voxdesk',
    audience: 'voxdesk-tools',
    subject: validated.conversationId,
  });
}

export function verifyConversationContext(token: string): ConversationContext {
  const payload = jwt.verify(token, env.INTERNAL_API_SECRET, {
    algorithms: ['HS256'],
    issuer: 'voxdesk',
    audience: 'voxdesk-tools',
  });
  return ConversationContextSchema.parse(payload);
}

