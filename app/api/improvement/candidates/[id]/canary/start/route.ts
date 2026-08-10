import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';
import { startCandidateCanary } from '@/lib/improvement/lifecycle';

const StartCanarySchema = z.object({
  minimumConversations: z.number().int().min(1).max(1000),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const correlationId = crypto.randomUUID();
  const access = await requireWorkspaceAccess(request, undefined, 'improvement:approve');
  if ('errorResponse' in access) return access.errorResponse;
  const parsed = StartCanarySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'A bounded canary sample is required.', correlationId } },
      { status: 400 }
    );
  }
  const { id } = await params;
  const result = await startCandidateCanary(
    access.workspaceId,
    id,
    access.userId,
    parsed.data.minimumConversations
  );
  if (!result.ok) {
    return NextResponse.json(
      { error: { code: result.code, message: result.message, correlationId } },
      { status: 409 }
    );
  }
  return NextResponse.json({ data: result.data, meta: { correlationId } });
}
