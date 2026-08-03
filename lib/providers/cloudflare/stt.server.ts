import "server-only";
import { env } from "@/lib/config/env";
import { runCloudflareModel } from "./client.server";
import { CloudflareAIError } from "./errors";

export async function transcribeAudioBufferWithCloudflare(
  audioBuffer: Buffer,
): Promise<{ text: string; confidence: number }> {
  const model = env.CLOUDFLARE_STT_MODEL || "@cf/deepgram/flux";

  const payload = {
    audio: Array.from(audioBuffer),
  };

  try {
    const result = await runCloudflareModel<any>(model, payload, 10000);
    const text = result?.text || result?.transcript || "";
    const confidence =
      typeof result?.confidence === "number" ? result.confidence : 0.95;

    return {
      text,
      confidence,
    };
  } catch (error) {
    if (error instanceof CloudflareAIError) throw error;
    throw new CloudflareAIError(
      error instanceof Error
        ? error.message
        : "Failed to transcribe audio with Cloudflare Flux.",
      "CLOUDFLARE_STT_FAILED",
      500,
    );
  }
}
