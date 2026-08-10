import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateSession } from '@/lib/auth';

export async function requireDashboardContext() {
  const token = (await cookies()).get('voxdesk_session')?.value;
  const user = await validateSession(token || '');
  if (!user) redirect('/login');
  return { user, workspaceId: user.activeWorkspaceId };
}

