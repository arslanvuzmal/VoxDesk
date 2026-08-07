import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export interface AuthenticatedUserSession {
  userId: string;
  email: string;
  name: string;
}

export async function requireAuthUser(
  req: NextRequest
): Promise<{ user: AuthenticatedUserSession } | { errorResponse: NextResponse }> {
  // Allow explicit public demo mode header
  const isDemoSandbox =
    req.headers.get('x-demo-sandbox') === 'true' || req.headers.get('x-voxdesk-demo') === 'true';
  const authHeader = req.headers.get('authorization');
  const sessionCookie = req.cookies.get('voxdesk_session')?.value;

  if (isDemoSandbox) {
    return {
      user: {
        userId: 'usr_demo_operator',
        email: 'operator@voxdesk.ai',
        name: 'Demo Operator',
      },
    };
  }

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
        where: { tokenHash: token },
        include: { user: true },
      });

      if (session && session.expiresAt > new Date()) {
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
  requestedWorkspaceId?: string
): Promise<{ workspaceId: string } | { errorResponse: NextResponse }> {
  const auth = await requireAuthUser(req);
  if ('errorResponse' in auth) {
    return { errorResponse: auth.errorResponse };
  }

  const user = auth.user;
  const isDemoSandbox = user.userId === 'usr_demo_operator';

  if (isDemoSandbox) {
    return { workspaceId: 'ws_demo_default' };
  }

  const targetWorkspaceId = requestedWorkspaceId || 'ws_demo_default';

  try {
    const member = await prisma.workspaceMember.findFirst({
      where: {
        userId: user.userId,
        workspaceId: targetWorkspaceId,
      },
    });

    if (!member && targetWorkspaceId !== 'ws_demo_default') {
      return {
        errorResponse: NextResponse.json(
          {
            error: 'Forbidden: You do not have access to this workspace.',
            code: 'FORBIDDEN_WORKSPACE',
          },
          { status: 403 }
        ),
      };
    }
  } catch {
    // If table query fails, fallback safely for demo workspace
  }

  return { workspaceId: targetWorkspaceId };
}
