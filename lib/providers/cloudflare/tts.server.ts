import "server-only";
import { env } from "@/lib/config/env";
import { runCloudflareModel } from "./client.server";
import { CloudflareAIError } from "./errors";

export async function generateCloudflareTTSAudio(
  text: string,
): Promise<{ audioBuffer: Buffer; contentType: string }> {
  const model = env.CLOUDFLARE_TTS_MODEL || "@cf/deepgram/aura-2-en";

  // Sanitize and limit text length for natural spoken audio
  const cleanText = text
    .replace(/[*_~`#]/g, "")
    .replace(/\bvs\b/gi, "versus")
    .replace(/\be\.g\.\b/gi, "for example")
    .replace(/\bi\.e\.\b/gi, "that is")
    .slice(0, 350);

  const payload = {
    text: cleanText,
  };

  try {
    const result = await runCloudflareModel<any>(model, payload, 10000);

    let audioBuffer: Buffer;
    if (result instanceof Buffer) {
      audioBuffer = result;
    } else if (typeof result === "string") {
      audioBuffer = Buffer.from(result, "base64");
    } else if (result?.audio) {
      audioBuffer = Buffer.from(result.audio, "base64");
    } else {
      throw new CloudflareAIError(
        "Invalid audio response format returned by Cloudflare TTS model.",
        "CLOUDFLARE_TTS_FORMAT_ERROR",
        500,
      );
    }

    return {
      audioBuffer,
      contentType: "audio/mpeg",
    };
  } catch (error) {
    if (error instanceof CloudflareAIError) throw error;
    throw new CloudflareAIError(
      error instanceof Error
        ? error.message
        : "Failed to synthesize text to speech via Cloudflare Workers AI.",
      "CLOUDFLARE_TTS_FAILED",
      500,
    );
  }
}
