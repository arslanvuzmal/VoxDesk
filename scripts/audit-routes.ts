import { existsSync } from 'fs';
import { join } from 'path';
import nextConfig from '../next.config';

const auditBaseUrl = process.env.AUDIT_BASE_URL?.replace(/\/$/, '');

interface RouteCheck {
  path: string;
  expectedStatus: number[];
  name: string;
}

const routesToAudit: RouteCheck[] = [
  { path: '/', expectedStatus: [200, 308], name: 'Landing Page' },
  { path: '/features', expectedStatus: [200, 308], name: 'Features Page' },
  { path: '/industries', expectedStatus: [200, 308], name: 'Industries Page' },
  { path: '/architecture', expectedStatus: [200, 308], name: 'Architecture Page' },
  { path: '/demo', expectedStatus: [200, 308], name: 'Demo Page' },
  { path: '/demo/story', expectedStatus: [200, 308], name: 'Guided Story Page' },
  { path: '/docs', expectedStatus: [200, 308], name: 'Documentation Page' },
  { path: '/status', expectedStatus: [200, 308], name: 'Status Page' },
  { path: '/privacy', expectedStatus: [200, 308], name: 'Privacy Policy Page' },
  { path: '/terms', expectedStatus: [200, 308], name: 'Terms of Service Page' },
  { path: '/login', expectedStatus: [200, 308], name: 'Login Page' },
  { path: '/register', expectedStatus: [200, 308], name: 'Register Page' },
  { path: '/dashboard', expectedStatus: [200, 307, 308], name: 'Dashboard Overview' },
  {
    path: '/dashboard/live',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Live Calls',
  },
  { path: '/dashboard/calls', expectedStatus: [200, 307, 308], name: 'Dashboard Calls' },
  {
    path: '/dashboard/appointments',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Appointments',
  },
  { path: '/dashboard/leads', expectedStatus: [200, 307, 308], name: 'Dashboard Leads' },
  { path: '/dashboard/agents', expectedStatus: [200, 307, 308], name: 'Dashboard Agents' },
  {
    path: '/dashboard/knowledge',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Knowledge',
  },
  {
    path: '/dashboard/escalations',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Escalations',
  },
  {
    path: '/dashboard/analytics',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Analytics',
  },
  {
    path: '/dashboard/providers',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Providers',
  },
  {
    path: '/dashboard/phone-numbers',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Phone Numbers',
  },
  {
    path: '/dashboard/integrations',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Integrations',
  },
  { path: '/dashboard/team', expectedStatus: [200, 307, 308], name: 'Dashboard Team' },
  {
    path: '/dashboard/audit',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Audit Logs',
  },
  {
    path: '/dashboard/settings',
    expectedStatus: [200, 307, 308],
    name: 'Dashboard Settings',
  },
  { path: '/agents', expectedStatus: [301, 307, 308], name: 'Legacy Agents Redirect' },
  { path: '/calls', expectedStatus: [301, 307, 308], name: 'Legacy Calls Redirect' },
  {
    path: '/appointments',
    expectedStatus: [301, 307, 308],
    name: 'Legacy Appointments Redirect',
  },
  { path: '/leads', expectedStatus: [301, 307, 308], name: 'Legacy Leads Redirect' },
];

function pageCandidates(routePath: string): string[] {
  const pagePath = routePath === '/' ? 'page.tsx' : `${routePath.slice(1)}/page.tsx`;
  return ['app', 'app/(marketing)', 'app/(auth)', 'app/(dashboard)'].map(root =>
    join(process.cwd(), root, pagePath)
  );
}

async function checkSourceRoutes(): Promise<number> {
  const configuredRedirects = (await nextConfig.redirects?.()) ?? [];
  const redirectSources = new Set(configuredRedirects.map(redirect => redirect.source));
  let failed = 0;

  console.log('Starting VoxDesk source route audit...\n');

  for (const route of routesToAudit) {
    const pageExists = pageCandidates(route.path).some(candidate => existsSync(candidate));
    const redirectExists = redirectSources.has(route.path);

    if (pageExists || redirectExists) {
      console.log(
        `[PASS] ${route.name} (${route.path}) -> ${pageExists ? 'page' : 'redirect'}`
      );
    } else {
      failed += 1;
      console.error(`[FAIL] ${route.name} (${route.path}) -> no page or redirect`);
    }
  }

  return failed;
}

async function checkRemoteRoute(route: RouteCheck): Promise<boolean> {
  if (!auditBaseUrl) return false;

  try {
    const response = await fetch(new URL(route.path, `${auditBaseUrl}/`), {
      redirect: 'manual',
      signal: AbortSignal.timeout(10_000),
    });
    const pass = route.expectedStatus.includes(response.status);

    if (pass) {
      console.log(`[PASS] ${route.name} (${route.path}) -> Status: ${response.status}`);
    } else {
      console.error(
        `[FAIL] ${route.name} (${route.path}) -> Expected: ${route.expectedStatus.join(
          '/'
        )}, Got: ${response.status}`
      );
    }

    return pass;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown request error';
    console.error(`[ERROR] ${route.name} (${route.path}): ${message}`);
    return false;
  }
}

async function checkRemoteRoutes(): Promise<number> {
  console.log(`Starting VoxDesk deployment route audit against ${auditBaseUrl}...\n`);
  let failed = 0;

  for (const route of routesToAudit) {
    if (!(await checkRemoteRoute(route))) failed += 1;
  }

  return failed;
}

async function runAudit() {
  const failed = auditBaseUrl ? await checkRemoteRoutes() : await checkSourceRoutes();
  const passed = routesToAudit.length - failed;

  console.log(`\nAudit complete: ${passed} passed, ${failed} failed.`);
  process.exitCode = failed > 0 ? 1 : 0;
}

void runAudit();
