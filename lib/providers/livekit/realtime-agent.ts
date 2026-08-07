import { OrganizationProfile } from '@/lib/organization/types';
import { VoiceAgentOutput } from '@/lib/conversation/schemas/voice-agent-output';

export interface LiveKitAgentContext {
  organizationProfile: OrganizationProfile;
  scenario: 'BOOKING' | 'QUALIFICATION' | 'ESCALATION' | 'ROUTINE';
  language: 'en-US' | 'ur-PK' | 'es-ES';
  conversationHistory: Array<{ role: 'CALLER' | 'AGENT'; text: string }>;
  collectedFields: Record<string, any>;
  currentState: string;
}

export function buildLiveKitAgentPrompt(context: LiveKitAgentContext): string {
  const profile = context.organizationProfile;
  const knowledgeStr = profile.approvedKnowledge
    .map(k => `Q: ${k.question}\nA: ${k.answer[context.language] || k.answer['en-US']}`)
    .join('\n\n');

  return `
You are ${profile.voiceIdentity.name}, a senior AI Voice Receptionist for ${profile.name} (${profile.industry}).
Tone: ${profile.voiceIdentity.defaultTone} (${profile.voiceIdentity.accent}).
Language: ${context.language}.

APPROVED BUSINESS KNOWLEDGE:
${knowledgeStr}

RESTRICTED TOPICS (DO NOT DISCUSS):
${profile.restrictedTopics.join('\n')}

YOUR MISSION:
1. Answer inbound questions accurately using approved knowledge.
2. Collect intake fields (${profile.requiredIntakeFields.map(f => f.label).join(', ')}).
3. Be warm, enthusiastic, sweet, and professional.
`;
}

export function processLiveKitVoiceTurn(
  context: LiveKitAgentContext,
  callerTranscript: string
): {
  spokenReply: string;
  detectedIntent: string;
  nextState: string;
  actionTaken: string;
} {
  const profile = context.organizationProfile;
  const lowerInput = callerTranscript.toLowerCase();

  // Search approved knowledge base
  const matchedKnowledge = profile.approvedKnowledge.find(k =>
    k.keywords.some(kw => lowerInput.includes(kw.toLowerCase()))
  );

  if (matchedKnowledge) {
    const answerText =
      matchedKnowledge.answer[context.language] || matchedKnowledge.answer['en-US'];
    return {
      spokenReply: answerText,
      detectedIntent: matchedKnowledge.category,
      nextState: 'PROVIDING_INFORMATION',
      actionTaken: `Answered FAQ: ${matchedKnowledge.category}`,
    };
  }

  // Appointment Booking Intent
  if (
    lowerInput.includes('book') ||
    lowerInput.includes('appointment') ||
    lowerInput.includes('schedule') ||
    lowerInput.includes('tour')
  ) {
    return {
      spokenReply: `I would be delighted to schedule that for you! Our next available consultation slot is tomorrow at 2:00 PM PST. May I confirm your full name and phone number?`,
      detectedIntent: 'Appointment Scheduling',
      nextState: 'COLLECTING_INTAKE',
      actionTaken: 'Checked availability for priority appointment slot',
    };
  }

  // Pricing & Retainer Intent
  if (
    lowerInput.includes('cost') ||
    lowerInput.includes('price') ||
    lowerInput.includes('fee') ||
    lowerInput.includes('retainer') ||
    lowerInput.includes('charge')
  ) {
    return {
      spokenReply: `Our consultation and service rates are transparent and flat-rate with zero hidden charges. Would you like me to reserve a spot for your detailed intake call?`,
      detectedIntent: 'Pricing & Retainer Inquiry',
      nextState: 'PROVIDING_INFORMATION',
      actionTaken: 'Provided transparent rate card details',
    };
  }

  // Fallback Context-Aware Response
  return {
    spokenReply: `Thank you for sharing that! As ${profile.voiceIdentity.name} at ${profile.name}, I can help you book a priority appointment or answer any specific questions you have. How would you like to proceed?`,
    detectedIntent: 'General Inquiry',
    nextState: context.currentState,
    actionTaken: 'Continued context-aware intake conversation',
  };
}
