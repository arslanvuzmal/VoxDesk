import { SupportedLanguage, DemoIntent } from "../schemas/voice-agent-output";

export interface ProviderExecutionResult {
  provider:
    "CLOUDFLARE" | "OPENROUTER" | "ELEVENLABS" | "BROWSER" | "DETERMINISTIC";
  model?: string;
  language: SupportedLanguage;
  success: boolean;
  fallbackUsed: boolean;
  latencyMs?: number;
  errorCode?: string;
}

export interface FinalCallResult {
  sessionId: string;
  organization: {
    id: string;
    name: string;
    industry: string;
  };
  language: SupportedLanguage;
  scenario: DemoIntent;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  turnsCompleted: number;
  transcript: Array<{ role: string; text: string; timestamp?: string }>;
  accumulatedFields: Record<string, unknown>;
  summary: string;
  qualification?: {
    score: number;
    category: "HOT" | "WARM" | "REVIEW" | "COLD";
    breakdown: Array<{
      criterion: string;
      score: number;
      weight: number;
      evidence: string;
      collected: boolean;
    }>;
    missingFields: string[];
    recommendedAction: string;
    followUpPriority: string;
  };
  businessActions: Array<{
    actionType: string;
    status: string;
    persisted: boolean;
    message: string;
    recordIds: Record<string, string>;
  }>;
  persistedRecords: {
    callId?: string;
    leadId?: string;
    appointmentId?: string;
    crmActivityId?: string;
  };
  providersUsed: {
    stt: ProviderExecutionResult;
    llm: ProviderExecutionResult;
    tts: ProviderExecutionResult;
  };
  degradedMode: boolean;
  warnings: string[];
}
