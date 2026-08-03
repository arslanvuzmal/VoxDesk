export interface ApiErrorResponse {
  error: string;
  code: string;
  correlationId?: string;
  recoverable?: boolean;
  guidedDemoUrl?: string;
}

export interface DemoSessionStartResponse {
  success: boolean;
  sessionId: string;
  scenario: "BOOKING" | "QUALIFICATION" | "ESCALATION" | "ROUTINE";
  expiresAt: number;
  maxTurns: number;
  correlationId?: string;
}

export interface TurnResponse {
  success: boolean;
  responseId: string;
  spokenReply: string;
  conversationState: string;
  extractedFields: Record<string, string>;
  actionTaken: string;
  turnsRemaining: number;
  fallbackUsed?: boolean;
  providerLabel?: string;
  correlationId?: string;
}

export interface STTTokenResponse {
  success: boolean;
  token: string;
  expiresAt?: number;
  correlationId?: string;
}

export interface TTSResponse {
  audioBuffer: ArrayBuffer;
  contentType: string;
}

export class DemoApiError extends Error {
  code: string;
  status: number;
  correlationId?: string;
  guidedDemoUrl?: string;

  constructor(
    message: string,
    code: string,
    status: number,
    correlationId?: string,
    guidedDemoUrl?: string,
  ) {
    super(message);
    this.name = "DemoApiError";
    this.code = code;
    this.status = status;
    this.correlationId = correlationId;
    this.guidedDemoUrl = guidedDemoUrl;
  }
}

async function handleJsonResponse<T>(response: Response): Promise<T> {
  let data: any = {};
  try {
    data = await response.json();
  } catch {
    // Empty JSON
  }

  if (!response.ok) {
    throw new DemoApiError(
      data.error || "An unexpected error occurred during the demo session.",
      data.code || `HTTP_${response.status}`,
      response.status,
      data.correlationId,
      data.guidedDemoUrl || "/demo/story",
    );
  }

  return data as T;
}

export async function startDemoSession(
  scenario: "BOOKING" | "QUALIFICATION" | "ESCALATION" | "ROUTINE",
): Promise<DemoSessionStartResponse> {
  const response = await fetch("/api/demo/session/start", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ scenario }),
  });

  return handleJsonResponse<DemoSessionStartResponse>(response);
}

export async function getDemoSessionStatus(): Promise<{
  success: boolean;
  session: any;
}> {
  const response = await fetch("/api/demo/session/status", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  return handleJsonResponse<{ success: boolean; session: any }>(response);
}

export async function submitDemoTurn(input: {
  clientTurnId: string;
  transcript: string;
}): Promise<TurnResponse> {
  const response = await fetch("/api/demo/respond", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  return handleJsonResponse<TurnResponse>(response);
}

export async function requestSTTToken(): Promise<STTTokenResponse> {
  const response = await fetch("/api/demo/stt-token", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  return handleJsonResponse<STTTokenResponse>(response);
}

export async function disconnectSTTConnection(): Promise<{ success: boolean }> {
  const response = await fetch("/api/demo/stt-disconnect", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  return handleJsonResponse<{ success: boolean }>(response);
}

export async function requestTTS(responseId: string): Promise<TTSResponse> {
  const response = await fetch("/api/demo/tts", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ responseId }),
  });

  if (!response.ok) {
    let data: any = {};
    try {
      data = await response.json();
    } catch {}
    throw new DemoApiError(
      data.error || "Failed to synthesize voice response.",
      data.code || `HTTP_${response.status}`,
      response.status,
      data.correlationId,
    );
  }

  const audioBuffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") || "audio/mpeg";

  return { audioBuffer, contentType };
}

export async function endDemoSession(): Promise<{
  success: boolean;
  summary: any;
}> {
  const response = await fetch("/api/demo/session/end", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  return handleJsonResponse<{ success: boolean; summary: any }>(response);
}

export async function deleteDemoSession(): Promise<{ success: boolean }> {
  const response = await fetch("/api/demo/session/delete", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  return handleJsonResponse<{ success: boolean }>(response);
}
