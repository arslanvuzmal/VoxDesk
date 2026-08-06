import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { getDemoSessionFromCookieToken } from "@/lib/demo/session";
import { resolveElevenLabsAgent } from "@/lib/elevenlabs/agent-registry.server";
import { env } from "@/lib/config/env";

export async function GET(req: NextRequest) {
  try {
    // 1. Read signed VoxDesk demo session cookie
    const cookieToken = req.cookies.get("voxdesk_demo_session")?.value;
    if (!cookieToken) {
      return NextResponse.json(
        { error: "Session required", code: "SESSION_REQUIRED" },
        { status: 401, headers: { "Cache-Control": "no-store, private" } },
      );
    }

    // 2. Validate session
    const session = await getDemoSessionFromCookieToken(cookieToken);
    if (!session) {
      return NextResponse.json(
        { error: "Session expired or invalid", code: "SESSION_REQUIRED" },
        { status: 401, headers: { "Cache-Control": "no-store, private" } },
      );
    }

    // 3. Resolve agent from server session attributes (Do NOT trust query params or body)
    const presetKey = (session.presetKey || "LEGAL") as any;
    const language = (session.language || "en-US") as any;

    const agent = resolveElevenLabsAgent(presetKey, language);
    if (!agent) {
      return NextResponse.json(
        {
          error: `No ElevenLabs agent configured for business preset '${presetKey}' and language '${language}'.`,
          code: "AGENT_NOT_CONFIGURED",
        },
        { status: 404, headers: { "Cache-Control": "no-store, private" } },
      );
    }

    // 4. Verify ElevenLabs API key
    const apiKey = process.env.ELEVENLABS_API_KEY || env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "ELEVENLABS_API_KEY is not configured on the server.",
          code: "ELEVENLABS_NOT_CONFIGURED",
        },
        { status: 503, headers: { "Cache-Control": "no-store, private" } },
      );
    }

    // 5. Request WebRTC Token from official ElevenLabs SDK
    const client = new ElevenLabsClient({ apiKey });

    try {
      const response =
        await client.conversationalAi.conversations.getWebrtcToken({
          agentId: agent.agentId,
        });

      if (!response || !response.token) {
        return NextResponse.json(
          {
            error: "Failed to retrieve WebRTC token from ElevenLabs API.",
            code: "ELEVENLABS_TOKEN_FAILED",
          },
          { status: 502, headers: { "Cache-Control": "no-store, private" } },
        );
      }

      return NextResponse.json(
        {
          token: response.token,
          sessionId: session.sessionId,
          agent: {
            displayName: agent.displayName,
            presetKey: agent.presetKey,
            language: agent.language,
          },
        },
        { headers: { "Cache-Control": "no-store, private" } },
      );
    } catch (sdkError: any) {
      console.error(
        "[ELEVENLABS TOKEN API ERROR]:",
        sdkError?.message || sdkError,
      );
      return NextResponse.json(
        {
          error: sdkError?.message || "ElevenLabs SDK token generation failed.",
          code: "ELEVENLABS_TOKEN_FAILED",
        },
        { status: 502, headers: { "Cache-Control": "no-store, private" } },
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500, headers: { "Cache-Control": "no-store, private" } },
    );
  }
}
