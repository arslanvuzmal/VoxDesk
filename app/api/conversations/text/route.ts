import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';
import { processTextTurn, TextChannelError } from '@/lib/conversation/text-channel';
import { enforceWorkspaceRateLimit } from '@/lib/security/workspace-rate-limit';
import { env } from '@/lib/config/env';

const TurnSchema = z.object({
  conversationId: z.string().min(1).optional(),
  businessId: z.string().min(1).optional(),
  agentId: z.string().min(1).optional(),
  languageCode: z.string().min(2).max(35).optional(),
  contactId: z.string().min(1).optional(),
  message: z.string().trim().min(1).max(4000),
});

export async function POST(request: NextRequest) {
  const authorization = await requireWorkspaceAccess(request, undefined, 'conversations:start');
  if ('errorResponse' in authorization) return authorization.errorResponse;
  const parsed = TurnSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'Invalid text conversation turn.' } },
      { status: 400 }
    );
  }
  const rateLimit = await enforceWorkspaceRateLimit(
    'text-turn',
    authorization.workspaceId,
    Number(env.TEXT_TURNS_PER_WORKSPACE_PER_MINUTE),
    60
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMIT', message: 'Text conversation capacity is temporarily limited.' } },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    );
  }
  try {
    const data = await processTextTurn({ ...parsed.data, workspaceId: authorization.workspaceId });
    return NextResponse.json({ data, meta: { correlationId: data.conversationId } });
  } catch (error) {
    if (error instanceof TextChannelError) {
      const status = error.code === 'NOT_FOUND' ? 404 : error.code === 'CONFLICT' ? 409 : 409;
      return NextResponse.json({ error: { code: error.code, message: error.message } }, { status });
    }
    return NextResponse.json(
      { error: { code: 'SERVICE_UNAVAILABLE', message: 'Text conversation is unavailable.' } },
      { status: 503 }
    );
  }
}

