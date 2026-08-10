import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { hashToken } from '@/lib/auth';
import { hasPermission, PermissionAction, WorkspaceRole } from '@/lib/permissions';

export interface AuthenticatedUserSession {
  userId: string;
  email: string;
  name: string;
}

export async function requireAuthUser(
  req: NextRequest
): Promise<{ user: AuthenticatedUserSession } | { errorResponse: NextResponse }> {
  const authHeader = req.headers.get('authorization');
  const sessionCookie = req.cookies.get('voxdesk_session')?.value;

  if (!authHeader && !sessionCookie) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Authentication required.', code: 'UNAUTHORIZED' },
        { status: 401 }
      ),
    };
  }

  try {
    const token = sessionCookie || authHeader?.replace('Bearer ', '');
    if (token) {
      const session = await prisma.session.findUnique({
        where: { tokenHash: hashToken(token) },
        include: { user: true },
      });

      if (session && session.expiresAt > new Date() && session.user.status === 'ACTIVE') {
        return {
          user: {
            userId: session.user.id,
            email: session.user.email,
            name: session.user.name,
          },
        };
      }
    }
  } catch (err) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Invalid or expired session token.', code: 'INVALID_TOKEN' },
        { status: 401 }
      ),
    };
  }

  return {
    errorResponse: NextResponse.json(
      { error: 'Invalid or expired session token.', code: 'INVALID_TOKEN' },
      { status: 401 }
    ),
  };
}

export async function requireWorkspaceAccess(
  req: NextRequest,
  requestedWorkspaceId?: string,
  permission?: PermissionAction
): Promise<
  { workspaceId: string; userId: string; role: WorkspaceRole } | { errorResponse: NextResponse }
> {
  const auth = await requireAuthUser(req);
  if ('errorResponse' in auth) {
    return { errorResponse: auth.errorResponse };
  }

  const user = auth.user;

  try {
    const member = await prisma.workspaceMember.findFirst({
      where: {
        userId: user.userId,
        ...(requestedWorkspaceId ? { workspaceId: requestedWorkspaceId } : {}),
      },
      orderBy: { id: 'asc' },
    });

    if (!member) {
      return {
        errorResponse: NextResponse.json(
          { error: 'Resource not found.', code: 'NOT_FOUND' },
          { status: 404 }
        ),
      };
    }

    const role = member.role as WorkspaceRole;
    if (permission && !hasPermission(role, permission)) {
      return {
        errorResponse: NextResponse.json(
          { error: 'Resource not found.', code: 'NOT_FOUND' },
          { status: 404 }
        ),
      };
    }

    return { workspaceId: member.workspaceId, userId: user.userId, role };
  } catch {
    return {
      errorResponse: NextResponse.json(
        { error: 'Authorization service unavailable.', code: 'AUTHORIZATION_UNAVAILABLE' },
        { status: 503 }
      ),
    };
  }
}

