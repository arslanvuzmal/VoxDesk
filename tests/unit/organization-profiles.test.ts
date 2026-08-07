import { describe, it, expect } from 'vitest';
import { listOrganizationPresets, getOrganizationProfile } from '@/lib/organization/registry';
import { searchProfileKnowledge } from '@/lib/conversation/knowledge/profile-knowledge';

describe('Organization Profiles & Knowledge Engine', () => {
  it('should return all 5 required organization presets', () => {
    const presets = listOrganizationPresets();
    expect(presets.length).toBe(5);

    const keys = presets.map(p => p.presetKey);
    expect(keys).toContain('LEGAL');
    expect(keys).toContain('HEALTHCARE');
    expect(keys).toContain('REAL_ESTATE');
    expect(keys).toContain('HOME_SERVICES');
    expect(keys).toContain('B2B_SERVICES');
  });

  it('should resolve organization profiles safely', () => {
    const legal = getOrganizationProfile('LEGAL');
    expect(legal.name).toBe('Northstar Legal Consultations');

    const healthcare = getOrganizationProfile('HEALTHCARE');
    expect(healthcare.name).toBe('Apex Dental & Medical Center');
  });

  it('should search profile approved knowledge accurately', () => {
    const legal = getOrganizationProfile('LEGAL');
    const res = searchProfileKnowledge('What are your office hours?', legal, 'en-US');

    expect(res.matched).toBe(true);
    expect(res.answer).toContain('500 Fifth Avenue');
  });

  it('should trigger emergency redirection for critical healthcare scenarios', () => {
    const healthcare = getOrganizationProfile('HEALTHCARE');
    const res = searchProfileKnowledge(
      'Patient reports facial swelling and difficulty breathing',
      healthcare,
      'en-US'
    );

    expect(res.matched).toBe(true);
    expect(res.isEmergencyEscalation).toBe(true);
  });
});
