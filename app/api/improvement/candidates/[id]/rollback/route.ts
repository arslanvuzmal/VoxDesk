import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';
import { rollbackCandidate } from '@/lib/improvement/lifecycle';

const RollbackSchema = z.object({
  reason: z.string().trim().min(10).max(2000),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const correlationId = crypto.randomUUID();
  const access = await requireWorkspaceAccess(request, undefined, 'improvement:approve');
  if ('errorResponse' in access) return access.errorResponse;
  const parsed = RollbackSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'A rollback reason is required.', correlationId } },
      { status: 400 }
    );
  }
  const { id } = await params;
  const result = await rollbackCandidate(access.workspaceId, id, access.userId, parsed.data.reason);
  if (!result.ok) {
    return NextResponse.json(
      { error: { code: result.code, message: result.message, correlationId } },
      { status: result.code === 'NOT_FOUND' ? 404 : 409 }
    );
  }
  return NextResponse.json({ data: result.data, meta: { correlationId } });
}
