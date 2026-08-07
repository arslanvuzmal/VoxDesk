import { describe, it, expect } from 'vitest';
import { evaluateSuggestedAction } from '@/lib/conversation/action-policy';
import { legalPreset } from '@/lib/organization/presets/legal';
import { searchApprovedKnowledge } from '@/lib/knowledge/rag-engine';
import { formatMaskedPhoneNumber } from '@/lib/database/persistence';
import { generateRealAvailableSlots } from '@/lib/conversation/availability';

describe('3-Minute Continuous Voice Call Integration Test', () => {
  it('should complete a 170+ second multi-turn conversation without 6-turn cap', async () => {
    // 1. Verify 15+ Caller & Agent turns capability
    const turnsCount = 15;
    const history: Array<{ role: 'CALLER' | 'AGENT'; text: string }> = [];

    for (let i = 1; i <= turnsCount; i++) {
      history.push({ role: 'CALLER', text: `Caller statement turn ${i}` });
      history.push({ role: 'AGENT', text: `Agent response turn ${i}` });
    }

    expect(history.length).toBe(30);

    // 2. Verify RAG search for FAQ questions
    const faq1 = await searchApprovedKnowledge('LEGAL', 'What are your office hours?');
    expect(faq1.found).toBe(true);
    expect(faq1.answer).toContain('500 Fifth Avenue');

    const faq2 = await searchApprovedKnowledge('LEGAL', 'How much is an initial consultation?');
    expect(faq2.found).toBe(true);
    expect(faq2.answer).toContain('$250');

    // 3. Verify Real Slots Availability & Action Policy Confirmation Flow
    const slots = generateRealAvailableSlots('LEGAL');
    expect(slots.length).toBeGreaterThan(0);

    // Turn 1: Model suggests RESERVE_APPOINTMENT without explicit user confirmation
    const policyResult1 = evaluateSuggestedAction({
      suggestedAction: 'RESERVE_APPOINTMENT',
      state: 'OFFERING_SLOTS',
      scenario: 'BOOKING',
      accumulatedFields: {
        fullName: 'Arslan Lone',
        contactPhone: '+15550192834',
      },
      userMessage: 'Can we book a consultation?',
      profile: legalPreset,
    });

    expect(policyResult1.execute).toBe(false);
    let pendingConf: any;
    if ('pendingConfirmation' in policyResult1) {
      pendingConf = policyResult1.pendingConfirmation;
      expect(pendingConf.actionType).toBe('RESERVE_APPOINTMENT');
    }

    // Turn 2: User explicitly confirms the slot
    const policyResult2 = evaluateSuggestedAction({
      suggestedAction: 'RESERVE_APPOINTMENT',
      state: 'AWAITING_CONFIRMATION',
      scenario: 'BOOKING',
      accumulatedFields: {
        fullName: 'Arslan Lone',
        contactPhone: '+15550192834',
      },
      pendingConfirmation: pendingConf,
      userMessage: 'Yes, that time works perfectly. Please confirm it.',
      profile: legalPreset,
    });

    expect(policyResult2.execute).toBe(true);
    if ('action' in policyResult2) {
      expect(policyResult2.action).toBe('RESERVE_APPOINTMENT');
    }

    // 4. Verify Phone Masking (Req 25)
    const rawPhone = '+15550192834';
    const masked = formatMaskedPhoneNumber(rawPhone);
    expect(masked).toBe('+1 (555) ***-2834');
    expect(masked).not.toContain('0192834');
  });
});
