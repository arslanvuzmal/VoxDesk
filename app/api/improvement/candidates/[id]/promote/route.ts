import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';
import { promoteCandidate } from '@/lib/improvement/lifecycle';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const correlationId = crypto.randomUUID();
  const access = await requireWorkspaceAccess(request, undefined, 'improvement:approve');
  if ('errorResponse' in access) return access.errorResponse;
  const { id } = await params;
  const result = await promoteCandidate(access.workspaceId, id, access.userId);
  if (!result.ok) {
    return NextResponse.json(
      { error: { code: result.code, message: result.message, correlationId } },
      { status: result.code === 'NOT_FOUND' ? 404 : 409 }
    );
  }
  return NextResponse.json({ data: result.data, meta: { correlationId } });
}
