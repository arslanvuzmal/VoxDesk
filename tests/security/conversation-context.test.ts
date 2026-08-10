import { describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  signConversationContext,
  verifyConversationContext,
} from '@/lib/security/conversation-context';
import { env } from '@/lib/config/env';

const context = {
  conversationId: 'conversation-1',
  workspaceId: 'workspace-a',
  businessId: 'business-a',
  contactId: null,
  agentId: 'agent-a',
  agentVersionId: 'agent-version-a',
  trainingPackVersionId: 'training-pack-a',
  channel: 'PHONE' as const,
  direction: 'INBOUND' as const,
  language: 'en-US',
};

describe('signed conversation context', () => {
  it('round trips trusted server claims', () => {
    expect(verifyConversationContext(signConversationContext(context))).toEqual(context);
  });

  it('rejects a token signed by another secret', () => {
    const forged = jwt.sign(context, 'attacker-secret', {
      algorithm: 'HS256',
      issuer: 'voxdesk',
      audience: 'voxdesk-tools',
    });
    expect(() => verifyConversationContext(forged)).toThrow();
  });

  it('rejects expired context', () => {
    const expired = jwt.sign(context, env.INTERNAL_API_SECRET, {
      algorithm: 'HS256',
      issuer: 'voxdesk',
      audience: 'voxdesk-tools',
      expiresIn: -1,
    });
    expect(() => verifyConversationContext(expired)).toThrow();
  });
});

