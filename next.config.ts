import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Public Route Consolidation
      { source: '/features', destination: '/#product', permanent: true },
      { source: '/industries', destination: '/#solutions', permanent: true },
      { source: '/architecture', destination: '/#enterprise', permanent: true },
      { source: '/demo/story', destination: '/#workflow', permanent: true },

      // Dashboard Route Consolidation
      { source: '/agents', destination: '/dashboard/agent', permanent: true },
      {
        source: '/dashboard/agents',
        destination: '/dashboard/agent',
        permanent: true,
      },
      {
        source: '/calls',
        destination: '/dashboard/conversations',
        permanent: true,
      },
      {
        source: '/dashboard/calls',
        destination: '/dashboard/conversations',
        permanent: true,
      },
      {
        source: '/calls/:path*',
        destination: '/dashboard/conversations',
        permanent: true,
      },
      {
        source: '/dashboard/calls/:path*',
        destination: '/dashboard/conversations',
        permanent: true,
      },
      {
        source: '/live',
        destination: '/dashboard/conversations?tab=live',
        permanent: true,
      },
      {
        source: '/dashboard/live',
        destination: '/dashboard/conversations?tab=live',
        permanent: true,
      },
      {
        source: '/escalations',
        destination: '/dashboard/conversations?tab=escalated',
        permanent: true,
      },
      {
        source: '/dashboard/escalations',
        destination: '/dashboard/conversations?tab=escalated',
        permanent: true,
      },
      { source: '/knowledge', destination: '/dashboard/knowledge', permanent: true },
      {
        source: '/audit',
        destination: '/dashboard/settings/audit',
        permanent: true,
      },
      {
        source: '/dashboard/audit',
        destination: '/dashboard/settings/audit',
        permanent: true,
      },

      // Standard Shortcuts
      {
        source: '/analytics',
        destination: '/dashboard/analytics',
        permanent: true,
      },
      {
        source: '/appointments',
        destination: '/dashboard/appointments',
        permanent: true,
      },
      {
        source: '/integrations',
        destination: '/dashboard/integrations',
        permanent: true,
      },
      { source: '/leads', destination: '/dashboard/leads', permanent: true },
      {
        source: '/phone-numbers',
        destination: '/dashboard/phone-numbers',
        permanent: true,
      },
      {
        source: '/providers',
        destination: '/dashboard/providers',
        permanent: true,
      },
      {
        source: '/settings',
        destination: '/dashboard/settings',
        permanent: true,
      },
      { source: '/team', destination: '/dashboard/team', permanent: true },
    ];
  },
};

export default nextConfig;
