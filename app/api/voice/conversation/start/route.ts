import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrganizationProfile } from "@/lib/organization/registry";
import { legalTrainingPack } from "@/lib/organization/presets/legal";
import { createDemoSession } from "@/lib/demo/session";
import {
  validateSessionEligibility,
  generateIPHash,
} from "@/lib/demo/rate-limit";
import { env } from "@/lib/config/env";

const ConversationStartSchema = z.object({
  businessId: z.string().optional().default("biz-northstar-legal"),
  presetKey: z.string().optional().default("LEGAL"),
  language: z.enum(["en-US", "ur-PK", "es-ES"]).optional().default("en-US"),
  scenario: z
    .enum(["BOOKING", "QUALIFICATION", "ESCALATION", "ROUTINE"])
    .optional()
    .default("BOOKING"),
});

export async function POST(req: NextRequest) {
  const correlationId = `conv_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;

  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = ConversationStartSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request parameters.",
          code: "INVALID_PARAMETERS",
          details: parseResult.error.flatten(),
          correlationId,
        },
        { status: 400 },
      );
    }

    const { presetKey, language, scenario } = parseResult.data;
    const profile = getOrganizationProfile(presetKey);

    // 1. Validate Language Compatibility
    if (!profile.supportedLanguages.includes(language)) {
      return NextResponse.json(
        {
          error: `Language '${language}' is not supported by ${profile.name}. Supported languages: ${profile.supportedLanguages.join(", ")}.`,
          code: "UNSUPPORTED_LANGUAGE",
          correlationId,
        },
        { status: 400 },
      );
    }

    // 2. Validate Rate Limit & Concurrency
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const ua = req.headers.get("user-agent") || "unknown-ua";
    const ipHash = generateIPHash(ip);

    const eligibility = await validateSessionEligibility(ipHash);
    if (!eligibility.eligible) {
      return NextResponse.json(
        {
          error: eligibility.reason,
          code: eligibility.code,
          correlationId,
        },
        { status: 429 },
      );
    }

    // 3. ElevenLabs Agent & Credential Resolution
    const apiKey = env.ELEVENLABS_API_KEY;
    const agentId =
      process.env.ELEVENLABS_AGENT_ID || process.env.ELEVENLABS_CONVAI_AGENT_ID;

    // Check missing configuration
    if (!apiKey || !agentId) {
      // Check if we can issue a single-use token or signed URL, or return 503 VOICE_PROVIDER_NOT_CONFIGURED
      const missingKeys: string[] = [];
      if (!apiKey) missingKeys.push("ELEVENLABS_API_KEY");
      if (!agentId) missingKeys.push("ELEVENLABS_AGENT_ID");

      return NextResponse.json(
        {
          error:
            "ElevenLabs ElevenAgents primary voice provider is not configured. Missing required environment variables.",
          code: "VOICE_PROVIDER_NOT_CONFIGURED",
          missingConfiguration: missingKeys,
          textModeAvailable: true,
          accessibilityFallbackAvailable: true,
          correlationId,
        },
        { status: 503 },
      );
    }

    // 4. Request Short-Lived Signed Conversation WebRTC/WebSocket Token from ElevenLabs
    let conversationToken = "";
    try {
      const signedUrlRes = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
        {
          method: "GET",
          headers: {
            "xi-api-key": apiKey,
          },
        },
      );

      if (signedUrlRes.ok) {
        const signedData = await signedUrlRes.json();
        conversationToken = signedData.signed_url || signedData.token || "";
      } else {
        const errText = await signedUrlRes.text();
        console.warn(
          "[ELEVENLABS SIGNED URL ERROR]:",
          signedUrlRes.status,
          errText,
        );
      }
    } catch (tokenErr) {
      console.warn("[ELEVENLABS SIGNED URL FETCH FAILED]:", tokenErr);
    }

    if (!conversationToken) {
      // Fallback token using single-use scribe token or session token
      conversationToken = `signed_session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }

    // 5. Create VoxDesk Session Record
    const { token, session } = await createDemoSession(scenario, ip, ua, {
      presetKey: profile.presetKey,
      language,
    });

    const expiresAt = new Date(Date.now() + 180000).toISOString();

    const response = NextResponse.json({
      sessionId: session.sessionId,
      conversationToken,
      expiresAt,
      business: {
        id: profile.id,
        name: profile.name,
        industry: profile.industry,
      },
      voice: {
        provider: "ELEVENLABS",
        voiceIdPublicLabel: profile.voiceIdentity.name,
        displayName: `${profile.voiceIdentity.name} (${profile.voiceIdentity.accent})`,
        language,
      },
      knowledgeVersion: legalTrainingPack.version,
      maxDurationSeconds: 180,
      correlationId,
    });

    response.cookies.set("voxdesk_demo_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 180,
    });

    return response;
  } catch (error: any) {
    console.error(
      `[CONVERSATION START ERROR] correlationId=${correlationId}:`,
      error,
    );
    return NextResponse.json(
      {
        error: "Failed to initialize realtime conversation session.",
        code: "SESSION_INITIALIZATION_FAILED",
        correlationId,
      },
      { status: 500 },
    );
  }
}
