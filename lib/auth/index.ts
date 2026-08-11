import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../database';
import { WorkspaceRole } from '../permissions';

export const SESSION_COOKIE_NAME = 'voxdesk_session';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  status: string;
  activeWorkspaceId: string;
  activeWorkspaceRole: WorkspaceRole;
}

export async function createSession(userId: string, workspaceId?: string) {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Days

  if (!prisma) {
    throw new Error('Session persistence is unavailable.');
  }

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function validateSession(token: string): Promise<SessionUser | null> {
  if (!token) return null;

  try {
    if (!prisma) return null;
    const tokenHash = hashToken(token);

    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            memberships: {
              include: {
                workspace: true,
              },
            },
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date() || session.user.status !== 'ACTIVE') {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      }
      return null;
    }

    const primaryMembership = session.user.memberships[0];
    if (!primaryMembership) return null;

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      status: session.user.status,
      activeWorkspaceId: primaryMembership.workspaceId,
      activeWorkspaceRole: primaryMembership.role as WorkspaceRole,
    };
  } catch (err) {
    return null;
  }
}

export async function revokeSession(token: string): Promise<void> {
  if (!token) return;
  const tokenHash = hashToken(token);
  try {
    if (prisma) {
      await prisma.session.deleteMany({ where: { tokenHash } }).catch(() => {});
    }
  } catch {}
}
