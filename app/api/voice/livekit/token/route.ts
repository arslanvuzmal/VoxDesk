import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateLiveKitRoomToken } from "@/lib/providers/livekit/client.server";

const LiveKitTokenSchema = z.object({
  roomName: z.string().optional().default("voxdesk-livekit-room"),
  participantName: z.string().optional().default("VoxDesk Caller"),
  identity: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = LiveKitTokenSchema.parse(body);

    const result = await generateLiveKitRoomToken({
      roomName: parsed.roomName,
      participantName: parsed.participantName,
      identity: parsed.identity,
    });

    return NextResponse.json({
      success: true,
      provider: "LiveKit Realtime WebRTC Engine",
      token: result.token,
      serverUrl: result.serverUrl,
      roomName: result.roomName,
      identity: result.identity,
    });
  } catch (error: any) {
    console.error("[LIVEKIT TOKEN ERROR]:", error);
    return NextResponse.json(
      {
        error: "Failed to generate LiveKit WebRTC token.",
        details: error?.message,
      },
      { status: 500 },
    );
  }
}
