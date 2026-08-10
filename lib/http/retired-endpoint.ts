import { NextResponse } from 'next/server';

export function retiredEndpoint(replacement?: string): NextResponse {
  const correlationId = crypto.randomUUID();
  return NextResponse.json(
    {
      error: {
        code: 'ENDPOINT_RETIRED',
        message: replacement
          ? `This legacy endpoint is unavailable. Use ${replacement}.`
          : 'This legacy endpoint is unavailable.',
        correlationId,
      },
    },
    { status: 410 }
  );
}

