import { OrganizationProfile, SupportedLanguage } from '@/lib/organization/types';

export interface KnowledgeMatchResult {
  matched: boolean;
  question: string;
  answer: string;
  citation?: string;
  confidence: number;
  isEmergencyEscalation?: boolean;
  escalationReason?: string;
  isRestrictedTopic?: boolean;
}

export function searchProfileKnowledge(
  userQuery: string,
  profile: OrganizationProfile,
  language: SupportedLanguage = 'en-US'
): KnowledgeMatchResult {
  const query = userQuery.toLowerCase().trim();

  // 1. Emergency Escalation Triggers Priority Check
  for (const trigger of profile.escalationTriggers) {
    const condWords = trigger.condition.toLowerCase().split(/\s+/);
    const matchesTrigger = condWords.some(w => w.length > 3 && query.includes(w));

    if (matchesTrigger) {
      const emergencyReply =
        profile.complianceDisclaimer[language] || profile.complianceDisclaimer['en-US'];

      return {
        matched: true,
        question: userQuery,
        answer: emergencyReply,
        citation: 'Emergency Compliance Escalation Protocol',
        confidence: 0.99,
        isEmergencyEscalation: true,
        escalationReason: trigger.reason,
      };
    }
  }

  // 2. Restricted Topics Check
  for (const restricted of profile.restrictedTopics) {
    const resWords = restricted.toLowerCase().split(/\s+/);
    const matchesRestricted = resWords.filter(w => w.length > 4 && query.includes(w)).length >= 2;

    if (matchesRestricted) {
      const disclaimer =
        profile.complianceDisclaimer[language] || profile.complianceDisclaimer['en-US'];
      return {
        matched: false,
        question: userQuery,
        answer: disclaimer,
        citation: 'Compliance Guardrail',
        confidence: 0.9,
        isRestrictedTopic: true,
      };
    }
  }

  // 3. Approved Knowledge Search
  let bestMatch: KnowledgeMatchResult = {
    matched: false,
    question: userQuery,
    answer: '',
    confidence: 0,
  };

  for (const item of profile.approvedKnowledge) {
    const matches = item.keywords.filter(kw => query.includes(kw.toLowerCase()));

    if (matches.length > 0) {
      const score = Math.min(0.95, 0.6 + matches.length * 0.15);
      if (score > bestMatch.confidence) {
        const localizedAnswer = item.answer[language] || item.answer['en-US'];
        bestMatch = {
          matched: true,
          question: item.question,
          answer: localizedAnswer,
          citation: item.citation,
          confidence: score,
        };
      }
    }
  }

  return bestMatch;
}
