import { NextRequest, NextResponse } from 'next/server';
import { getVoiceProvider } from '@/lib/voice/providers/factory';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const providerHeader = req.headers.get('x-voice-provider') || 'DEMO';
    const provider = getVoiceProvider(providerHeader);

    // Convert headers map
    const headersObj: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headersObj[key.toLowerCase()] = value;
    });

    const isValid = await provider.verifyWebhook(headersObj, rawBody);

    if (!isValid && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    let parsedBody: Record<string, unknown> = {};
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      parsedBody = { rawText: rawBody };
    }

    const event = provider.parseWebhookEvent(parsedBody);

    return NextResponse.json({
      received: true,
      provider: providerHeader,
      eventType: event.eventType,
      providerCallId: event.providerCallId,
      timestamp: event.timestamp.toISOString(),
    });
  } catch (error) {
    console.error('Webhook Telephony Error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
