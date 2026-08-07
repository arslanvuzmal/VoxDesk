export type IndustryType =
  'LEGAL' | 'HEALTHCARE' | 'REAL_ESTATE' | 'HOME_SERVICES' | 'B2B_SERVICES';

export type SupportedLanguage = 'en-US' | 'ur-PK' | 'es-ES';

export type VoiceTone =
  'PROFESSIONAL' | 'WARM' | 'WARM_SALES' | 'CALM' | 'EMPATHETIC' | 'CONFIDENT' | 'ENERGETIC';

export interface ApprovedKnowledgeItem {
  id: string;
  category: string;
  keywords: string[];
  question: string;
  answer: Record<SupportedLanguage, string>;
  citation?: string;
}

export interface RequiredIntakeField {
  key: string;
  label: string;
  required: boolean;
  type: 'text' | 'phone' | 'email' | 'date' | 'number' | 'select';
  description: string;
}

export interface QualificationCriterion {
  id: string;
  name: string;
  weight: number; // e.g., 25 points out of 100
  condition: string;
  scoringGuide: string;
}

export interface EscalationTrigger {
  id: string;
  condition: string;
  reason: string;
  urgency: 'HIGH' | 'CRITICAL';
}

export interface OrganizationProfile {
  id: string;
  presetKey: IndustryType;
  name: string;
  industry: string;
  tagline: string;
  description: string;
  timeZone: string;
  workingHours: {
    days: string;
    hours: string;
    afterHoursPolicy: string;
  };
  supportedLanguages: SupportedLanguage[];
  defaultLanguage: SupportedLanguage;
  voiceIdentity: {
    name: string;
    gender: 'female' | 'male';
    accent: string;
    defaultTone: VoiceTone;
  };
  greetings: Record<SupportedLanguage, string>;
  services: {
    id: string;
    name: string;
    description: string;
  }[];
  approvedKnowledge: ApprovedKnowledgeItem[];
  restrictedTopics: string[];
  complianceDisclaimer: Record<SupportedLanguage, string>;
  requiredIntakeFields: RequiredIntakeField[];
  qualificationRules: {
    criteria: QualificationCriterion[];
    scoreThresholds: {
      hot: number; // e.g. >= 75
      warm: number; // e.g. >= 45
      review: number; // e.g. >= 20
    };
  };
  escalationTriggers: EscalationTrigger[];
  escalationDestination: {
    department: string;
    phone: string;
    email: string;
  };
  appointmentSettings: {
    slotDurationMinutes: number;
    advanceNoticeHours: number;
    availableDays: string[];
    sampleSlots: string[];
  };
  crmPipelineStages: string[];
  followUpPolicy: string;
  allowedBusinessActions: string[];
}
