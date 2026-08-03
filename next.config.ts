import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/agents", destination: "/dashboard/agents", permanent: true },
      {
        source: "/analytics",
        destination: "/dashboard/analytics",
        permanent: true,
      },
      {
        source: "/appointments",
        destination: "/dashboard/appointments",
        permanent: true,
      },
      { source: "/audit", destination: "/dashboard/audit", permanent: true },
      { source: "/calls", destination: "/dashboard/calls", permanent: true },
      {
        source: "/calls/:path*",
        destination: "/dashboard/calls/:path*",
        permanent: true,
      },
      {
        source: "/escalations",
        destination: "/dashboard/escalations",
        permanent: true,
      },
      {
        source: "/integrations",
        destination: "/dashboard/integrations",
        permanent: true,
      },
      {
        source: "/knowledge",
        destination: "/dashboard/knowledge",
        permanent: true,
      },
      { source: "/leads", destination: "/dashboard/leads", permanent: true },
      { source: "/live", destination: "/dashboard/live", permanent: true },
      {
        source: "/phone-numbers",
        destination: "/dashboard/phone-numbers",
        permanent: true,
      },
      {
        source: "/providers",
        destination: "/dashboard/providers",
        permanent: true,
      },
      {
        source: "/settings",
        destination: "/dashboard/settings",
        permanent: true,
      },
      { source: "/team", destination: "/dashboard/team", permanent: true },
    ];
  },
};

export default nextConfig;
