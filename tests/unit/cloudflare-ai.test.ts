import { describe, it, expect } from 'vitest';
import { CloudflareStructuredOutputSchema } from '@/lib/providers/cloudflare/schemas';
import { getDeterministicRoutineAnswer } from '@/lib/conversation/knowledge/northstar-legal';
import {
  checkCloudflareSessionSttLimit,
  checkCloudflareSessionTtsLimit,
} from '@/lib/providers/cloudflare/usage';

describe('Cloudflare Workers AI Unit Tests', () => {
  it('validates structured output schema correctly', () => {
    const validPayload = {
      spokenReply: 'I can help schedule a legal consultation for you.',
      intent: 'BOOKING',
      suggestedState: 'CHECKING_AVAILABILITY',
      extractedFields: {
        name: 'Arslan Lone',
        service: 'Contract Review',
      },
      suggestedAction: 'CHECK_DEMO_CALENDAR',
      confidence: 0.98,
      requiresHumanReview: false,
    };

    const parsed = CloudflareStructuredOutputSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid intent in structured output schema', () => {
    const invalidPayload = {
      spokenReply: 'Hello',
      intent: 'INVALID_INTENT_KEY',
      suggestedState: 'READY',
      extractedFields: {},
      suggestedAction: 'NONE',
    };

    const parsed = CloudflareStructuredOutputSchema.safeParse(invalidPayload);
    expect(parsed.success).toBe(false);
  });

  it('matches routine questions deterministically without calling LLM', () => {
    const answer = getDeterministicRoutineAnswer('What time do you open?');
    expect(answer).not.toBeNull();
    expect(answer?.spokenReply).toContain('Monday through Friday');
    expect(answer?.suggestedAction).toBe('CHECK_DEMO_CALENDAR');
  });

  it('enforces session STT and TTS usage budget limits', () => {
    expect(checkCloudflareSessionSttLimit(100, 50)).toBe(true);
    expect(checkCloudflareSessionSttLimit(170, 20)).toBe(false);

    expect(checkCloudflareSessionTtsLimit(1000, 500)).toBe(true);
    expect(checkCloudflareSessionTtsLimit(1700, 200)).toBe(false);
  });
});
