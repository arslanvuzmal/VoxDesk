import http from 'http';
import https from 'https';

const BASE_URL = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:3000';

interface RouteCheck {
  path: string;
  expectedStatus: number | number[];
  name: string;
  allowRedirect?: boolean;
}

const routesToAudit: RouteCheck[] = [
  // Public Pages (HTTP 200 or 308 for Vercel edge redirects)
  { path: '/', expectedStatus: [200, 308], name: 'Landing Page' },
  { path: '/features', expectedStatus: [200, 308], name: 'Features Page' },
  { path: '/industries', expectedStatus: [200, 308], name: 'Industries Page' },
  {
    path: '/architecture',
    expectedStatus: [200, 308],
    name: 'Architecture Page',
  },
  { path: '/demo', expectedStatus: [200, 308], name: 'Demo Page' },
  {
    path: '/demo/story',
    expectedStatus: [200, 308],
    name: 'Guided Story Page',
  },
  { path: '/docs', expectedStatus: [200, 308], name: 'Documentation Page' },
  { path: '/status', expectedStatus: [200, 308], name: 'Status Page' },
  { path: '/privacy', expectedStatus: [200, 308], name: 'Privacy Policy Page' },
  { path: '/terms', expectedStatus: [200, 308], name: 'Terms of Service Page' },
  { path: '/login', expectedStatus: [200, 308], name: 'Login Page' },
  { path: '/register', expectedStatus: [200, 308], name: 'Register Page' },

  // Protected Dashboard Routes (Unauthenticated should redirect to /login - HTTP 307/308 or 200 if handled via layout)
  {
    path: '/dashboard',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Overview',
    allowRedirect: true,
  },
  {
    path: '/dashboard/live',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Live Calls',
    allowRedirect: true,
  },
  {
    path: '/dashboard/calls',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Calls',
    allowRedirect: true,
  },
  {
    path: '/dashboard/appointments',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Appointments',
    allowRedirect: true,
  },
  {
    path: '/dashboard/leads',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Leads',
    allowRedirect: true,
  },
  {
    path: '/dashboard/agents',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Agents',
    allowRedirect: true,
  },
  {
    path: '/dashboard/knowledge',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Knowledge',
    allowRedirect: true,
  },
  {
    path: '/dashboard/escalations',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Escalations',
    allowRedirect: true,
  },
  {
    path: '/dashboard/analytics',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Analytics',
    allowRedirect: true,
  },
  {
    path: '/dashboard/providers',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Providers',
    allowRedirect: true,
  },
  {
    path: '/dashboard/phone-numbers',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Phone Numbers',
    allowRedirect: true,
  },
  {
    path: '/dashboard/integrations',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Integrations',
    allowRedirect: true,
  },
  {
    path: '/dashboard/team',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Team',
    allowRedirect: true,
  },
  {
    path: '/dashboard/audit',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Audit Logs',
    allowRedirect: true,
  },
  {
    path: '/dashboard/settings',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Settings',
    allowRedirect: true,
  },

  // Backward Compatible Redirects (HTTP 301 / 308)
  {
    path: '/agents',
    expectedStatus: [301, 307, 308],
    name: 'Legacy Agents Redirect',
  },
  {
    path: '/calls',
    expectedStatus: [301, 307, 308],
    name: 'Legacy Calls Redirect',
  },
  {
    path: '/appointments',
    expectedStatus: [301, 307, 308],
    name: 'Legacy Appointments Redirect',
  },
  {
    path: '/leads',
    expectedStatus: [301, 307, 308],
    name: 'Legacy Leads Redirect',
  },
];

async function checkUrl(route: RouteCheck): Promise<boolean> {
  const url = `${BASE_URL}${route.path}`;
  const client = url.startsWith('https') ? https : http;

  return new Promise(resolve => {
    const req = client.get(url, res => {
      const statusCode = res.statusCode || 500;
      const expected = Array.isArray(route.expectedStatus)
        ? route.expectedStatus
        : [route.expectedStatus];

      const pass = expected.includes(statusCode);

      if (pass) {
        console.log(`[PASS] ${route.name} (${route.path}) -> Status: ${statusCode}`);
        resolve(true);
      } else {
        console.error(
          `[FAIL] ${route.name} (${route.path}) -> Expected: ${expected.join('/')}, Got: ${statusCode}`
        );
        resolve(false);
      }
    });

    req.on('error', err => {
      console.error(`[ERROR] ${route.name} (${route.path}):`, err.message);
      resolve(false);
    });
  });
}

async function runAudit() {
  console.log(`Starting VoxDesk AI Route Audit against ${BASE_URL}...\n`);
  let passed = 0;
  let failed = 0;

  for (const route of routesToAudit) {
    const success = await checkUrl(route);
    if (success) passed++;
    else failed++;
  }

  console.log(`\nAudit Complete: ${passed} PASSED, ${failed} FAILED.`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAudit();
