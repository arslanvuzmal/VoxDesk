# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: routes.spec.ts >> VoxDesk AI Route Structure & Authentication E2E Tests >> Unknown routes should return 404 and render custom not-found page
- Location: tests\e2e\routes.spec.ts:52:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "Page not found"
Received string:    "404 - Page Not Found"
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h1')
    14 × locator resolved to <h1 class="text-3xl font-bold text-gray-900">404 - Page Not Found</h1>
       - unexpected value "404 - Page Not Found"

```

```yaml
- heading "404 - Page Not Found" [level=1]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("VoxDesk AI Route Structure & Authentication E2E Tests", () => {
  4  |   test("Public routes should return HTTP 200", async ({ page }) => {
  5  |     const publicPaths = [
  6  |       "/",
  7  |       "/features",
  8  |       "/industries",
  9  |       "/architecture",
  10 |       "/demo",
  11 |       "/demo/story",
  12 |       "/docs",
  13 |       "/status",
  14 |       "/privacy",
  15 |       "/terms",
  16 |       "/login",
  17 |     ];
  18 | 
  19 |     for (const path of publicPaths) {
  20 |       const response = await page.goto(path);
  21 |       expect(response?.status()).toBe(200);
  22 |     }
  23 |   });
  24 | 
  25 |   test("Unauthenticated requests to dashboard routes should redirect to login", async ({
  26 |     page,
  27 |   }) => {
  28 |     const dashboardPaths = [
  29 |       "/dashboard",
  30 |       "/dashboard/live",
  31 |       "/dashboard/calls",
  32 |       "/dashboard/appointments",
  33 |       "/dashboard/leads",
  34 |       "/dashboard/agents",
  35 |       "/dashboard/knowledge",
  36 |       "/dashboard/escalations",
  37 |       "/dashboard/analytics",
  38 |       "/dashboard/providers",
  39 |       "/dashboard/phone-numbers",
  40 |       "/dashboard/integrations",
  41 |       "/dashboard/team",
  42 |       "/dashboard/audit",
  43 |       "/dashboard/settings",
  44 |     ];
  45 | 
  46 |     for (const path of dashboardPaths) {
  47 |       await page.goto(path);
  48 |       expect(page.url()).toContain("/login");
  49 |     }
  50 |   });
  51 | 
  52 |   test("Unknown routes should return 404 and render custom not-found page", async ({
  53 |     page,
  54 |   }) => {
  55 |     const response = await page.goto("/this-route-does-not-exist");
  56 |     expect(response?.status()).toBe(404);
> 57 |     await expect(page.locator("h1")).toContainText("Page not found");
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  58 |   });
  59 | });
  60 | 
```