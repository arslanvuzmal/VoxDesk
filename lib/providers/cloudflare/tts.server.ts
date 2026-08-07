import 'server-only';
import { env } from '@/lib/config/env';
import { CloudflareAIError } from './errors';

export async function generateCloudflareTTSAudio(
  text: string
): Promise<{ audioBuffer: Buffer; contentType: string }> {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = env.CLOUDFLARE_API_TOKEN;
  const model = env.CLOUDFLARE_TTS_MODEL || '@cf/deepgram/aura-2-en';

  if (!accountId || !apiToken) {
    throw new CloudflareAIError('Cloudflare credentials missing', 'CLOUDFLARE_DISABLED', 503);
  }

  // Sanitize and limit text length for natural spoken audio
  const cleanText = text
    .replace(/[*_~`#]/g, '')
    .replace(/\bvs\b/gi, 'versus')
    .replace(/\be\.g\.\b/gi, 'for example')
    .replace(/\bi\.e\.\b/gi, 'that is')
    .slice(0, 350);

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: cleanText }),
    });

    if (!response.ok) {
      throw new CloudflareAIError(
        `Cloudflare TTS model ${model} failed with status ${response.status}`,
        'CLOUDFLARE_TTS_FAILED',
        response.status
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    return {
      audioBuffer,
      contentType: response.headers.get('content-type') || 'audio/mpeg',
    };
  } catch (error) {
    if (error instanceof CloudflareAIError) throw error;
    throw new CloudflareAIError(
      error instanceof Error
        ? error.message
        : 'Failed to synthesize text to speech via Cloudflare Workers AI.',
      'CLOUDFLARE_TTS_FAILED',
      500
    );
  }
}
