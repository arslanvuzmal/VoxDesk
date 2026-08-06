import { NextRequest, NextResponse } from "next/server";
import { isElevenLabsConfigured, resolveElevenLabsAgent } from "@/lib/elevenlabs/agent-registry.server";

export async function GET(req: NextRequest) {
  try {
    const presets = [
      "LEGAL",
      "HEALTHCARE",
      "REAL_ESTATE",
      "HOME_SERVICES",
      "B2B_SERVICES",
    ] as const;

    const languages = ["en-US", "ur-PK", "es-ES"] as const;

    const config: Record<string, { configured: boolean; agentId?: string; displayName?: string }> = {};

    for (const preset of presets) {
      for (const language of languages) {
        const configured = isElevenLabsConfigured(preset, language);
        const agent = resolveElevenLabsAgent(preset, language);
        config[`${preset}:${language}`] = {
          configured,
          agentId: agent?.agentId,
          displayName: agent?.displayName,
        };
      }
    }

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check ElevenLabs configuration",
      },
      { status: 500 },
    );
  }
}