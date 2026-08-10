export interface DashboardRouteItem {
  label: string;
  href: string;
  permission?: string;
  iconName?: string;
  category?: 'OPERATIONS' | 'INTELLIGENCE' | 'SYSTEM';
}

export const dashboardRoutes: DashboardRouteItem[] = [
  {
    label: 'Overview',
    href: '/dashboard',
    permission: 'VIEW_DASHBOARD',
    category: 'OPERATIONS',
  },
  {
    label: 'Conversations',
    href: '/dashboard/conversations',
    permission: 'VIEW_CALLS',
    category: 'OPERATIONS',
  },
  {
    label: 'Contacts',
    href: '/dashboard/contacts',
    permission: 'VIEW_LEADS',
    category: 'OPERATIONS',
  },
  {
    label: 'Appointments',
    href: '/dashboard/appointments',
    permission: 'VIEW_APPOINTMENTS',
    category: 'OPERATIONS',
  },
  {
    label: 'Opportunities',
    href: '/dashboard/opportunities',
    permission: 'VIEW_LEADS',
    category: 'OPERATIONS',
  },
  {
    label: 'Tasks',
    href: '/dashboard/tasks',
    permission: 'VIEW_TASKS',
    category: 'OPERATIONS',
  },
  {
    label: 'Campaigns',
    href: '/dashboard/campaigns',
    permission: 'VIEW_CAMPAIGNS',
    category: 'OPERATIONS',
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    permission: 'VIEW_ANALYTICS',
    category: 'INTELLIGENCE',
  },
  {
    label: 'Improvement',
    href: '/dashboard/improvement',
    permission: 'VIEW_IMPROVEMENT',
    category: 'INTELLIGENCE',
  },
  {
    label: 'Agent',
    href: '/dashboard/agent',
    permission: 'MANAGE_AGENTS',
    category: 'INTELLIGENCE',
  },
  {
    label: 'Knowledge',
    href: '/dashboard/knowledge',
    permission: 'MANAGE_AGENTS',
    category: 'INTELLIGENCE',
  },
  {
    label: 'Integrations',
    href: '/dashboard/integrations',
    permission: 'MANAGE_INTEGRATIONS',
    category: 'SYSTEM',
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    permission: 'MANAGE_SETTINGS',
    category: 'SYSTEM',
  },
];

