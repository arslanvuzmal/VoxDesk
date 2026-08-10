import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';
import { completeCandidateCanary } from '@/lib/improvement/lifecycle';

const CompleteCanarySchema = z.object({
  totalConversations: z.number().int().nonnegative(),
  criticalFailures: z.number().int().nonnegative(),
  regressionDetected: z.boolean(),
  dimensionResults: z.record(z.string(), z.number().finite()),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const correlationId = crypto.randomUUID();
  const access = await requireWorkspaceAccess(request, undefined, 'improvement:approve');
  if ('errorResponse' in access) return access.errorResponse;
  const parsed = CompleteCanarySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'Structured canary evidence is required.', correlationId } },
      { status: 400 }
    );
  }
  const { id } = await params;
  const result = await completeCandidateCanary(
    access.workspaceId,
    id,
    access.userId,
    parsed.data
  );
  if (!result.ok) {
    return NextResponse.json(
      { error: { code: result.code, message: result.message, correlationId } },
      { status: result.code === 'CANARY_FAILED' ? 422 : 409 }
    );
  }
  return NextResponse.json({ data: result.data, meta: { correlationId } });
}
