import { OrganizationProfile, IndustryType } from './types';
import { legalPreset } from './presets/legal';
import { healthcarePreset } from './presets/healthcare';
import { realEstatePreset } from './presets/real-estate';
import { homeServicesPreset } from './presets/home-services';
import { b2bServicesPreset } from './presets/b2b-services';

const ALL_PRESETS: Record<string, OrganizationProfile> = {
  LEGAL: legalPreset,
  HEALTHCARE: healthcarePreset,
  REAL_ESTATE: realEstatePreset,
  HOME_SERVICES: homeServicesPreset,
  B2B_SERVICES: b2bServicesPreset,
  'preset-legal': legalPreset,
  'preset-healthcare': healthcarePreset,
  'preset-real-estate': realEstatePreset,
  'preset-home-services': homeServicesPreset,
  'preset-b2b-services': b2bServicesPreset,
};

export function listOrganizationPresets(): OrganizationProfile[] {
  return [legalPreset, healthcarePreset, realEstatePreset, homeServicesPreset, b2bServicesPreset];
}

export function getOrganizationProfile(presetKeyOrId?: string): OrganizationProfile {
  if (!presetKeyOrId) return legalPreset;

  const normalized = presetKeyOrId.trim().toUpperCase();
  if (ALL_PRESETS[normalized]) {
    return ALL_PRESETS[normalized];
  }

  const lower = presetKeyOrId.trim().toLowerCase();
  if (ALL_PRESETS[lower]) {
    return ALL_PRESETS[lower];
  }

  return legalPreset;
}
