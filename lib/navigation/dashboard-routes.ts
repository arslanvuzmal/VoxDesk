export interface DashboardRouteItem {
  label: string;
  href: string;
  permission?: string;
  iconName?: string;
  category?: "OPERATIONS" | "INTELLIGENCE" | "SYSTEM";
}

export const dashboardRoutes: DashboardRouteItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    permission: "VIEW_DASHBOARD",
    category: "OPERATIONS",
  },
  {
    label: "Conversations",
    href: "/dashboard/conversations",
    permission: "VIEW_CALLS",
    category: "OPERATIONS",
  },
  {
    label: "Contacts",
    href: "/dashboard/leads",
    permission: "VIEW_LEADS",
    category: "OPERATIONS",
  },
  {
    label: "Appointments",
    href: "/dashboard/appointments",
    permission: "VIEW_APPOINTMENTS",
    category: "OPERATIONS",
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    permission: "VIEW_ANALYTICS",
    category: "INTELLIGENCE",
  },
  {
    label: "Agent Setup",
    href: "/dashboard/agent",
    permission: "MANAGE_AGENTS",
    category: "INTELLIGENCE",
  },
  {
    label: "Integrations",
    href: "/dashboard/integrations",
    permission: "MANAGE_INTEGRATIONS",
    category: "SYSTEM",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    permission: "MANAGE_SETTINGS",
    category: "SYSTEM",
  },
];
