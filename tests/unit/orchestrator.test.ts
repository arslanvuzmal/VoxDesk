import { describe, expect, it } from 'vitest';
import { decideSpecialist } from '@/lib/conversation/orchestrator';

describe('conversation orchestrator', () => {
  it.each([
    ['reschedule my appointment', 'SCHEDULING'],
    ['I need a quote', 'SALES_QUALIFICATION'],
    ['my invoice is wrong', 'ACCOUNT_SERVICE'],
    ['where do I upload the form', 'DOCUMENT_INTAKE'],
    ['I am unhappy and need a manager', 'COMPLAINT_RESOLUTION'],
    ['check my service status', 'CUSTOMER_SUPPORT'],
    ['what time do you open', 'GENERAL_RECEPTION'],
  ])('routes %s to %s', (intent, specialist) => {
    expect(decideSpecialist({ intent }).specialist).toBe(specialist);
  });

  it('prioritizes explicit human requests over intent routing', () => {
    expect(decideSpecialist({ intent: 'book an appointment', requestedHuman: true })).toEqual({
      specialist: 'ESCALATION',
      requiresHuman: true,
      reason: 'CUSTOMER_REQUEST',
    });
  });

  it('routes compliance flags to supervised escalation', () => {
    expect(
      decideSpecialist({ intent: 'general question', complianceFlags: ['DISCLOSURE_MISSING'] })
    ).toMatchObject({ specialist: 'ESCALATION', requiresHuman: true, reason: 'COMPLIANCE_REVIEW' });
  });
});

