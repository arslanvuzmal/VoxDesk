export interface DashboardRouteItem {
  label: string;
  href: string;
  permission?: string;
  iconName?: string;
  category?: "CORE" | "MANAGEMENT" | "SYSTEM";
}

export const dashboardRoutes: DashboardRouteItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    permission: "VIEW_DASHBOARD",
    category: "CORE",
  },
  {
    label: "Live calls",
    href: "/dashboard/live",
    permission: "OPERATE_CALLS",
    category: "CORE",
  },
  {
    label: "Calls",
    href: "/dashboard/calls",
    permission: "VIEW_CALLS",
    category: "CORE",
  },
  {
    label: "Appointments",
    href: "/dashboard/appointments",
    permission: "VIEW_APPOINTMENTS",
    category: "CORE",
  },
  {
    label: "Leads",
    href: "/dashboard/leads",
    permission: "VIEW_LEADS",
    category: "CORE",
  },
  {
    label: "Agents",
    href: "/dashboard/agents",
    permission: "MANAGE_AGENTS",
    category: "MANAGEMENT",
  },
  {
    label: "Knowledge",
    href: "/dashboard/knowledge",
    permission: "MANAGE_KNOWLEDGE",
    category: "MANAGEMENT",
  },
  {
    label: "Escalations",
    href: "/dashboard/escalations",
    permission: "VIEW_ESCALATIONS",
    category: "MANAGEMENT",
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    permission: "VIEW_ANALYTICS",
    category: "MANAGEMENT",
  },
  {
    label: "Providers",
    href: "/dashboard/providers",
    permission: "MANAGE_PROVIDERS",
    category: "SYSTEM",
  },
  {
    label: "Phone numbers",
    href: "/dashboard/phone-numbers",
    permission: "MANAGE_NUMBERS",
    category: "SYSTEM",
  },
  {
    label: "Integrations",
    href: "/dashboard/integrations",
    permission: "MANAGE_INTEGRATIONS",
    category: "SYSTEM",
  },
  {
    label: "Team",
    href: "/dashboard/team",
    permission: "MANAGE_TEAM",
    category: "SYSTEM",
  },
  {
    label: "Audit logs",
    href: "/dashboard/audit",
    permission: "VIEW_AUDIT",
    category: "SYSTEM",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    permission: "MANAGE_SETTINGS",
    category: "SYSTEM",
  },
];
