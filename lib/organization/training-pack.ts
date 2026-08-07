import { z } from 'zod';

export const SupportedLanguageEnum = z.enum(['en-US', 'ur-PK', 'es-ES']);
export type SupportedLanguage = z.infer<typeof SupportedLanguageEnum>;

export const BusinessIdentitySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  industry: z.string().min(1),
  presetKey: z.enum(['LEGAL', 'HEALTHCARE', 'REAL_ESTATE', 'HOME_SERVICES', 'B2B_SERVICES']),
  tagline: z.string(),
  description: z.string(),
  timeZone: z.string(),
  primaryPhone: z.string(),
  primaryEmail: z.string().email(),
  website: z.string().url(),
});
export type BusinessIdentity = z.infer<typeof BusinessIdentitySchema>;

export const BusinessVoiceConfigurationSchema = z.object({
  provider: z.literal('ELEVENLABS'),
  voiceId: z.string().min(1),
  displayName: z.string().min(1),
  supportedLanguages: z.array(SupportedLanguageEnum).min(1),
  modelId: z.string(),
  stability: z.number().min(0).max(1),
  similarityBoost: z.number().min(0).max(1),
  style: z.number().min(0).max(1),
  speed: z.number().min(0.5).max(2),
  useSpeakerBoost: z.boolean(),
  pronunciationDictionaryId: z.string().optional(),
  speakingStyle: z.string(),
});
export type BusinessVoiceConfiguration = z.infer<typeof BusinessVoiceConfigurationSchema>;

export const ServiceDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  durationMinutes: z.number().positive(),
  requiresConsultation: z.boolean(),
});
export type ServiceDefinition = z.infer<typeof ServiceDefinitionSchema>;

export const BusinessLocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  timeZone: z.string(),
  isPrimary: z.boolean(),
});
export type BusinessLocation = z.infer<typeof BusinessLocationSchema>;

export const WorkingHoursPolicySchema = z.object({
  days: z.array(z.string()),
  openTime: z.string(),
  closeTime: z.string(),
  timeZone: z.string(),
  afterHoursPolicy: z.string(),
  holidays: z.array(z.string()),
});
export type WorkingHoursPolicy = z.infer<typeof WorkingHoursPolicySchema>;

export const PricingPolicySchema = z.object({
  serviceId: z.string(),
  pricingType: z.enum(['FIXED', 'HOURLY', 'CUSTOM', 'FREE_CONSULTATION']),
  amount: z.number().optional(),
  currency: z.string().default('USD'),
  description: z.string(),
  disclaimer: z.string().optional(),
});
export type PricingPolicy = z.infer<typeof PricingPolicySchema>;

export const BusinessPolicySchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  content: z.string(),
});
export type BusinessPolicy = z.infer<typeof BusinessPolicySchema>;

export const ApprovedKnowledgeEntrySchema = z.object({
  id: z.string(),
  category: z.string(),
  question: z.string(),
  keywords: z.array(z.string()),
  answer: z.record(SupportedLanguageEnum, z.string()),
  sourceId: z.string().optional(),
  citation: z.string().optional(),
});
export type ApprovedKnowledgeEntry = z.infer<typeof ApprovedKnowledgeEntrySchema>;

export const IntakeFieldDefinitionSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(['text', 'phone', 'email', 'date', 'number', 'select']),
  required: z.boolean(),
  description: z.string(),
  options: z.array(z.string()).optional(),
});
export type IntakeFieldDefinition = z.infer<typeof IntakeFieldDefinitionSchema>;

export const QualificationPolicySchema = z.object({
  enabled: z.boolean(),
  criteria: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      weight: z.number(),
      condition: z.string(),
      scoringGuide: z.string(),
    })
  ),
  thresholds: z.object({
    hot: z.number(),
    warm: z.number(),
    review: z.number(),
  }),
});
export type QualificationPolicy = z.infer<typeof QualificationPolicySchema>;

export const AppointmentPolicySchema = z.object({
  enabled: z.boolean(),
  slotDurationMinutes: z.number(),
  advanceNoticeHours: z.number(),
  maxDaysInAdvance: z.number(),
  availableDays: z.array(z.string()),
  timeZone: z.string(),
});
export type AppointmentPolicy = z.infer<typeof AppointmentPolicySchema>;

export const EscalationPolicySchema = z.object({
  enabled: z.boolean(),
  destinationDepartment: z.string(),
  destinationPhone: z.string(),
  destinationEmail: z.string(),
  triggers: z.array(
    z.object({
      id: z.string(),
      condition: z.string(),
      reason: z.string(),
      urgency: z.enum(['HIGH', 'CRITICAL']),
    })
  ),
});
export type EscalationPolicy = z.infer<typeof EscalationPolicySchema>;

export const RestrictedTopicSchema = z.object({
  id: z.string(),
  topic: z.string(),
  reason: z.string(),
  mandatoryRefusal: z.record(SupportedLanguageEnum, z.string()),
});
export type RestrictedTopic = z.infer<typeof RestrictedTopicSchema>;

export const LocalizedDisclaimerSchema = z.object({
  id: z.string(),
  category: z.string(),
  text: z.record(SupportedLanguageEnum, z.string()),
  mandatoryPosition: z.enum(['GREETING', 'INTAKE', 'BOOKING', 'EVERY_TURN']),
});
export type LocalizedDisclaimer = z.infer<typeof LocalizedDisclaimerSchema>;

export const PronunciationEntrySchema = z.object({
  term: z.string(),
  phonetic: z.string(),
  language: SupportedLanguageEnum,
});
export type PronunciationEntry = z.infer<typeof PronunciationEntrySchema>;

export const KnowledgeSourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['PDF', 'DOCX', 'TXT', 'MARKDOWN', 'URL', 'STRUCTURED_FAQ']),
  sourceUrlOrPath: z.string().optional(),
  indexedAt: z.string(),
  version: z.string(),
});
export type KnowledgeSource = z.infer<typeof KnowledgeSourceSchema>;

export const BusinessTrainingPackSchema = z.object({
  business: BusinessIdentitySchema,
  voice: BusinessVoiceConfigurationSchema,
  services: z.array(ServiceDefinitionSchema),
  locations: z.array(BusinessLocationSchema),
  workingHours: WorkingHoursPolicySchema,
  pricing: z.array(PricingPolicySchema),
  policies: z.array(BusinessPolicySchema),
  faq: z.array(ApprovedKnowledgeEntrySchema),
  requiredIntakeFields: z.array(IntakeFieldDefinitionSchema),
  qualificationPolicy: QualificationPolicySchema,
  appointmentPolicy: AppointmentPolicySchema,
  escalationPolicy: EscalationPolicySchema,
  restrictedTopics: z.array(RestrictedTopicSchema),
  requiredDisclaimers: z.array(LocalizedDisclaimerSchema),
  pronunciationDictionary: z.array(PronunciationEntrySchema),
  knowledgeSources: z.array(KnowledgeSourceSchema),
  supportedLanguages: z.array(SupportedLanguageEnum).min(1),
  version: z.string(),
  effectiveFrom: z.string(),
});

export type BusinessTrainingPack = z.infer<typeof BusinessTrainingPackSchema>;

export function validateBusinessTrainingPack(pack: unknown): BusinessTrainingPack {
  return BusinessTrainingPackSchema.parse(pack);
}
