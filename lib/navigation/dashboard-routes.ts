import { hasPermission, type PermissionAction, type WorkspaceRole } from '@/lib/permissions';

export interface DashboardRouteItem {
  label: string;
  href: string;
  permission: PermissionAction;
  iconName?: string;
  category: 'OPERATIONS' | 'INTELLIGENCE' | 'SYSTEM';
}

export const dashboardRoutes: DashboardRouteItem[] = [
  {
    label: 'Overview',
    href: '/dashboard',
    permission: 'calls:view',
    category: 'OPERATIONS',
  },
  {
    label: 'Conversations',
    href: '/dashboard/conversations',
    permission: 'calls:view',
    category: 'OPERATIONS',
  },
  {
    label: 'Contacts',
    href: '/dashboard/contacts',
    permission: 'calls:view',
    category: 'OPERATIONS',
  },
  {
    label: 'Appointments',
    href: '/dashboard/appointments',
    permission: 'calls:view',
    category: 'OPERATIONS',
  },
  {
    label: 'Opportunities',
    href: '/dashboard/opportunities',
    permission: 'calls:view',
    category: 'OPERATIONS',
  },
  {
    label: 'Tasks',
    href: '/dashboard/tasks',
    permission: 'calls:view',
    category: 'OPERATIONS',
  },
  {
    label: 'Campaigns',
    href: '/dashboard/campaigns',
    permission: 'campaigns:view',
    category: 'OPERATIONS',
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    permission: 'analytics:view',
    category: 'INTELLIGENCE',
  },
  {
    label: 'Improvement',
    href: '/dashboard/improvement',
    permission: 'improvement:view',
    category: 'INTELLIGENCE',
  },
  {
    label: 'Agent',
    href: '/dashboard/agent',
    permission: 'agents:edit',
    category: 'INTELLIGENCE',
  },
  {
    label: 'Knowledge',
    href: '/dashboard/knowledge',
    permission: 'knowledge:manage',
    category: 'INTELLIGENCE',
  },
  {
    label: 'Integrations',
    href: '/dashboard/integrations',
    permission: 'credentials:manage',
    category: 'SYSTEM',
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    permission: 'workspace:manage',
    category: 'SYSTEM',
  },
];

export function getVisibleDashboardRoutes(role: WorkspaceRole): DashboardRouteItem[] {
  return dashboardRoutes.filter(route => hasPermission(role, route.permission));
}
