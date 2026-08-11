import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';
import { evaluateCandidate } from '@/lib/improvement/lifecycle';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const correlationId = crypto.randomUUID();
  const access = await requireWorkspaceAccess(request, undefined, 'improvement:approve');
  if ('errorResponse' in access) return access.errorResponse;
  const { id } = await params;
  const result = await evaluateCandidate(access.workspaceId, id, access.userId);
  if (!result.ok) {
    const status = result.code === 'NOT_FOUND' ? 404 : result.code === 'CONFLICT' ? 409 : 422;
    return NextResponse.json(
      { error: { code: result.code, message: result.message, correlationId } },
      { status }
    );
  }
  return NextResponse.json({ data: result.data, meta: { correlationId } });
}
