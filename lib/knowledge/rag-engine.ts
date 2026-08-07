import { SupportedLanguage } from '@/lib/organization/types';
import { getOrganizationProfile } from '@/lib/organization/registry';

export interface KnowledgeDocumentChunk {
  id: string;
  sourceId: string;
  sourceTitle: string;
  category: string;
  content: string;
  keywords: string[];
  language: SupportedLanguage;
  version: string;
}

export interface RetrievalResult {
  query: string;
  found: boolean;
  score: number;
  answer?: string;
  sourceId?: string;
  citation?: string;
  chunks: KnowledgeDocumentChunk[];
  uncertaintyTriggered: boolean;
}

export const MANDATORY_UNCERTAINTY_RESPONSE: Record<SupportedLanguage, string> = {
  'en-US':
    'I don’t have an approved answer for that in the business information available to me. I can record the question and arrange for a team member to follow up.',
  'ur-PK':
    'میرا پاس دستیاب کاروبار کی معلومات میں اس کا کوئی منظور شدہ جواب نہیں ہے۔ میں آپ کا سوال ریکارڈ کر کے کسی ٹیم ممبر کو رابطے کی درخواست بھیج سکتی ہوں۔',
  'es-ES':
    'No tengo una respuesta aprobada para eso en la información comercial disponible. Puedo registrar la pregunta y organizar que un miembro del equipo se comunique con usted.',
};

export async function searchApprovedKnowledge(
  presetKey: string,
  userQuery: string,
  language: SupportedLanguage = 'en-US'
): Promise<RetrievalResult> {
  const profile = getOrganizationProfile(presetKey);
  const normalizedQuery = userQuery.trim().toLowerCase();

  if (!normalizedQuery) {
    return {
      query: userQuery,
      found: false,
      score: 0,
      answer: MANDATORY_UNCERTAINTY_RESPONSE[language],
      chunks: [],
      uncertaintyTriggered: true,
    };
  }

  const matches = profile.approvedKnowledge.map(item => {
    let score = 0;
    const itemQuestion = item.question.toLowerCase();
    const itemAns = (item.answer[language] || item.answer['en-US'] || '').toLowerCase();

    // 1. Direct Question Match
    if (normalizedQuery.includes(itemQuestion) || itemQuestion.includes(normalizedQuery)) {
      score += 40;
    }

    // 2. Keyword Matches
    item.keywords.forEach(kw => {
      const kwLower = kw.toLowerCase();
      if (normalizedQuery.includes(kwLower)) {
        score += 20;
      }
    });

    // 3. Token Overlap Score
    const queryTokens = normalizedQuery.split(/\s+/).filter(t => t.length > 2);
    queryTokens.forEach(token => {
      if (itemQuestion.includes(token)) score += 5;
      if (itemAns.includes(token)) score += 3;
    });

    return { item, score };
  });

  matches.sort((a, b) => b.score - a.score);
  const bestMatch = matches[0];

  if (bestMatch && bestMatch.score >= 20) {
    const selectedAnswer = bestMatch.item.answer[language] || bestMatch.item.answer['en-US'];

    return {
      query: userQuery,
      found: true,
      score: bestMatch.score,
      answer: selectedAnswer,
      sourceId: bestMatch.item.id,
      citation: bestMatch.item.citation || profile.name,
      chunks: [
        {
          id: bestMatch.item.id,
          sourceId: bestMatch.item.id,
          sourceTitle: bestMatch.item.citation || profile.name,
          category: bestMatch.item.category,
          content: selectedAnswer,
          keywords: bestMatch.item.keywords,
          language,
          version: '2.5.0',
        },
      ],
      uncertaintyTriggered: false,
    };
  }

  return {
    query: userQuery,
    found: false,
    score: bestMatch ? bestMatch.score : 0,
    answer: MANDATORY_UNCERTAINTY_RESPONSE[language],
    chunks: [],
    uncertaintyTriggered: true,
  };
}
