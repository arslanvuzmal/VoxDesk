import 'server-only';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { validateSession } from '@/lib/auth';
import { hasPermission, type PermissionAction } from '@/lib/permissions';

export async function requireDashboardContext() {
  const token = (await cookies()).get('voxdesk_session')?.value;
  const user = await validateSession(token || '');
  if (!user) redirect('/login');
  return { user, workspaceId: user.activeWorkspaceId };
}

export async function requireDashboardPermission(permission: PermissionAction) {
  const context = await requireDashboardContext();
  if (!hasPermission(context.user.activeWorkspaceRole, permission)) {
    notFound();
  }
  return context;
}
