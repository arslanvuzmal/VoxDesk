# VoxDesk AI — Route & 404 Failure Audit

**Project Owner:** Arslan Vuzmal Lone  
**Audit Date:** 2026-08-03  
**Target Domain:** https://voxdesk-ai.vercel.app

---

## 1. Root Cause Analysis

In the Next.js App Router, route groups enclosed in parentheses like `(dashboard)` do not add a URL segment to the route path.
The current codebase had dashboard subfolders placed as direct children of `app/(dashboard)/`:

- `app/(dashboard)/agents/page.tsx` → generated `/agents` (Intended: `/dashboard/agents`)
- `app/(dashboard)/live/page.tsx` → generated `/live` (Intended: `/dashboard/live`)
- `app/(dashboard)/calls/page.tsx` → generated `/calls` (Intended: `/dashboard/calls`)
- `app/(dashboard)/calls/[id]/page.tsx` → generated `/calls/[id]` (Intended: `/dashboard/calls/[id]`)
- etc.

When visitors or UI navigation links navigated to `/dashboard/agents` or `/dashboard/calls`, Next.js returned a 404 Not Found error because no route existed under `/dashboard/*`.

---

## 2. Route Audit Matrix

| Intended Route             | Current Route    | Current Status    | Source File                              | Required Change                                            |
| -------------------------- | ---------------- | ----------------- | ---------------------------------------- | ---------------------------------------------------------- |
| `/dashboard`               | `/dashboard`     | 200 OK            | `app/(dashboard)/dashboard/page.tsx`     | Keep at `/dashboard`                                       |
| `/dashboard/live`          | `/live`          | 404 (at intended) | `app/(dashboard)/live/page.tsx`          | Move to `app/(dashboard)/dashboard/live/page.tsx`          |
| `/dashboard/calls`         | `/calls`         | 404 (at intended) | `app/(dashboard)/calls/page.tsx`         | Move to `app/(dashboard)/dashboard/calls/page.tsx`         |
| `/dashboard/calls/[id]`    | `/calls/[id]`    | 404 (at intended) | `app/(dashboard)/calls/[id]/page.tsx`    | Move to `app/(dashboard)/dashboard/calls/[id]/page.tsx`    |
| `/dashboard/appointments`  | `/appointments`  | 404 (at intended) | `app/(dashboard)/appointments/page.tsx`  | Move to `app/(dashboard)/dashboard/appointments/page.tsx`  |
| `/dashboard/leads`         | `/leads`         | 404 (at intended) | `app/(dashboard)/leads/page.tsx`         | Move to `app/(dashboard)/dashboard/leads/page.tsx`         |
| `/dashboard/agents`        | `/agents`        | 404 (at intended) | `app/(dashboard)/agents/page.tsx`        | Move to `app/(dashboard)/dashboard/agents/page.tsx`        |
| `/dashboard/knowledge`     | `/knowledge`     | 404 (at intended) | `app/(dashboard)/knowledge/page.tsx`     | Move to `app/(dashboard)/dashboard/knowledge/page.tsx`     |
| `/dashboard/escalations`   | `/escalations`   | 404 (at intended) | `app/(dashboard)/escalations/page.tsx`   | Move to `app/(dashboard)/dashboard/escalations/page.tsx`   |
| `/dashboard/analytics`     | `/analytics`     | 404 (at intended) | `app/(dashboard)/analytics/page.tsx`     | Move to `app/(dashboard)/dashboard/analytics/page.tsx`     |
| `/dashboard/providers`     | `/providers`     | 404 (at intended) | `app/(dashboard)/providers/page.tsx`     | Move to `app/(dashboard)/dashboard/providers/page.tsx`     |
| `/dashboard/phone-numbers` | `/phone-numbers` | 404 (at intended) | `app/(dashboard)/phone-numbers/page.tsx` | Move to `app/(dashboard)/dashboard/phone-numbers/page.tsx` |
| `/dashboard/integrations`  | `/integrations`  | 404 (at intended) | `app/(dashboard)/integrations/page.tsx`  | Move to `app/(dashboard)/dashboard/integrations/page.tsx`  |
| `/dashboard/team`          | `/team`          | 404 (at intended) | `app/(dashboard)/team/page.tsx`          | Move to `app/(dashboard)/dashboard/team/page.tsx`          |
| `/dashboard/audit`         | `/audit`         | 404 (at intended) | `app/(dashboard)/audit/page.tsx`         | Move to `app/(dashboard)/dashboard/audit/page.tsx`         |
| `/dashboard/settings`      | `/settings`      | 404 (at intended) | `app/(dashboard)/settings/page.tsx`      | Move to `app/(dashboard)/dashboard/settings/page.tsx`      |
| `/privacy`                 | None             | Missing           | `app/(marketing)/privacy/page.tsx`       | Create public privacy page                                 |
| `/terms`                   | None             | Missing           | `app/(marketing)/terms/page.tsx`         | Create public terms page                                   |

---

## 3. Mandatory Plan

1. **Restructure Directory Hierarchy**: Move all subfolders under `app/(dashboard)/` into `app/(dashboard)/dashboard/`.
2. **Move Layout**: Place the dashboard layout at `app/(dashboard)/dashboard/layout.tsx`.
3. **Centralized Route Configuration**: Create `lib/navigation/dashboard-routes.ts`.
4. **Update Sidebar & Navigation**: Update `components/ui/sidebar.tsx` and mobile navigation components to consume `dashboardRoutes`.
5. **Update Internal Links & Redirects**: Update all `Link` components, call table links, breadcrumbs, login redirects, and logout redirects.
6. **Backward-Compatible Redirects**: Add permanent redirects in `next.config.ts` from `/agents` → `/dashboard/agents`, `/calls` → `/dashboard/calls`, etc.
7. **Authentication & Middleware**: Secure `/dashboard` and `/dashboard/*` with callback URL support (`/login?callbackUrl=...`).
8. **Public Pages**: Create `/privacy`, `/terms`, custom `app/not-found.tsx`, and dashboard `error.tsx`, `loading.tsx`, `not-found.tsx`.
9. **Sitemap & Robots**: Update `app/sitemap.ts` and `app/robots.ts`.
10. **Audit Script & Tests**: Create `scripts/audit-routes.ts` (`npm run audit:routes`) and Playwright tests in `tests/e2e/routes.spec.ts`.
