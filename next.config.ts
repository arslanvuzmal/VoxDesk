import type { NextConfig } from 'next';

const isDevelopment = process.env.NODE_ENV === 'development';

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.elevenlabs.io https://*.elevenlabs.io wss://*.elevenlabs.io",
  "media-src 'self' blob: data: https://*.elevenlabs.io",
  "worker-src 'self' blob:",
  "frame-src 'self' https://*.elevenlabs.io",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDevelopment ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), geolocation=(), microphone=(self), payment=(), usb=()',
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
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
