# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: routes.spec.ts >> VoxDesk AI Route Structure & Authentication E2E Tests >> Public routes should return HTTP 200
- Location: tests\e2e\routes.spec.ts:4:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - generic [ref=f1e3]:
    - heading "404 - Page Not Found" [level=1] [ref=f1e7]
    - paragraph [ref=f1e8]: The page or route you are looking for does not exist in TITAN OS.
    - link "Return to Command Center" [ref=f1e10] [cursor=pointer]:
      - /url: /dashboard
  - alert [ref=f1e11]
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
> 21 |       expect(response?.status()).toBe(200);
     |                                  ^ Error: expect(received).toBe(expected) // Object.is equality
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
  57 |     await expect(page.locator("h1")).toContainText("Page not found");
  58 |   });
  59 | });
  60 | 
```