import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { env } from '@/lib/config/env';
import { processOutboundQueue } from '@/workers/outbound-campaigns';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function hasWorkerAuthorization(request: NextRequest): boolean {
  const header = request.headers.get('authorization') || '';
  const provided = header.replace(/^Bearer\s+/i, '');
  const expected = env.INTERNAL_API_SECRET;
  if (!provided || provided.length !== expected.length) return false;

  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

async function process(request: NextRequest) {
  if (!hasWorkerAuthorization(request)) {
    return NextResponse.json(
      {
        error: { code: 'UNAUTHORIZED', message: 'Worker authorization is required.' },
      },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const result = await processOutboundQueue();
  return NextResponse.json(
    { data: result },
    { headers: { 'Cache-Control': 'no-store, private' } }
  );
}

export async function GET(request: NextRequest) {
  return process(request);
}

export async function POST(request: NextRequest) {
  return process(request);
}
