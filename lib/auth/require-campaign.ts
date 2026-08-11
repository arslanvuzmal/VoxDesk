import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireAuthUser } from '@/lib/auth/require-session';
import { hasPermission, PermissionAction, WorkspaceRole } from '@/lib/permissions';

export async function requireCampaignAccess(
  req: NextRequest,
  campaignId: string,
  permission: PermissionAction
): Promise<
  { workspaceId: string; userId: string; role: WorkspaceRole } | { errorResponse: NextResponse }
> {
  const auth = await requireAuthUser(req);
  if ('errorResponse' in auth) return auth;

  try {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        workspace: { members: { some: { userId: auth.user.userId } } },
      },
      select: {
        workspaceId: true,
        workspace: {
          select: {
            members: {
              where: { userId: auth.user.userId },
              select: { role: true },
              take: 1,
            },
          },
        },
      },
    });
    const role = campaign?.workspace.members[0]?.role as WorkspaceRole | undefined;
    if (!campaign || !role || !hasPermission(role, permission)) {
      return {
        errorResponse: NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Campaign was not found.' } },
          { status: 404 }
        ),
      };
    }
    return { workspaceId: campaign.workspaceId, userId: auth.user.userId, role };
  } catch {
    return {
      errorResponse: NextResponse.json(
        { error: { code: 'AUTHORIZATION_UNAVAILABLE', message: 'Authorization unavailable.' } },
        { status: 503 }
      ),
    };
  }
}
