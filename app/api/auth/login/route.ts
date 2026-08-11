import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database';
import { createSession, SESSION_COOKIE_NAME, verifyPassword } from '@/lib/auth';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email or password format' }, { status: 400 });
    }

    const { email, password } = parsed.data;

    try {
      if (prisma) {
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            memberships: {
              include: { workspace: true },
            },
          },
        });

        if (user && user.status === 'ACTIVE' && user.memberships.length > 0) {
          const isValid = await verifyPassword(password, user.passwordHash);
          if (isValid) {
            const { token } = await createSession(user.id);
            const response = NextResponse.json({
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                activeWorkspaceId: user.memberships[0]?.workspaceId || '',
                activeWorkspaceRole: user.memberships[0]?.role || 'OPERATOR',
              },
            });

            response.cookies.set(SESSION_COOKIE_NAME, token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 7 * 24 * 3600,
            });

            return response;
          }
        }
      }
    } catch {
      return NextResponse.json(
        { error: 'The demo dashboard is temporarily unavailable.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
