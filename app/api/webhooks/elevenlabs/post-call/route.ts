import { after, NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/config/env';
import { verifyElevenLabsWebhook } from '@/lib/security/elevenlabs-webhook';
import { ElevenLabsPostCallSchema } from '@/lib/voice-agent/elevenlabs-postcall';
import { queueElevenLabsPostCall } from '@/lib/voice-agent/elevenlabs-postcall-handler';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = env.ELEVENLABS_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: { code: 'NOT_CONFIGURED', message: 'Webhook is not configured.' } },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  const verification = verifyElevenLabsWebhook(
    rawBody,
    request.headers.get('elevenlabs-signature'),
    secret
  );
  if (!verification.valid) {
    return NextResponse.json(
      { error: { code: 'INVALID_SIGNATURE', message: 'Invalid webhook signature.' } },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_JSON', message: 'Invalid JSON payload.' } },
      { status: 400 }
    );
  }
  const parsed = ElevenLabsPostCallSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'UNSUPPORTED_EVENT', message: 'Unsupported webhook payload.' } },
      { status: 400 }
    );
  }

  return queueElevenLabsPostCall(rawBody, parsed.data, after);
}

