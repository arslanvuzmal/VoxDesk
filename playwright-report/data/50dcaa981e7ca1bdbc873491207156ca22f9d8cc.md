# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: demo-flow.spec.ts >> VoxDesk AI Interactive Public Demo & CRM E2E Flow >> should complete full multi-turn booking flow and verify database outcome receipt
- Location: tests\e2e\demo-flow.spec.ts:4:7

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /VoxDesk AI/i
Received string:  "TITAN | Enterprise Autonomous AI OS"
Timeout: 5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    14 × locator resolved to <html lang="en" class="inter_5901b7c6-module__ec5Qua__variable h-full antialiased">…</html>
       - unexpected value "TITAN | Enterprise Autonomous AI OS"

```

```yaml
- img
- heading "404 - Page Not Found" [level=1]
- paragraph: The page or route you are looking for does not exist in TITAN OS.
- link "Return to Command Center":
  - /url: /dashboard
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("VoxDesk AI Interactive Public Demo & CRM E2E Flow", () => {
  4  |   test("should complete full multi-turn booking flow and verify database outcome receipt", async ({
  5  |     page,
  6  |   }) => {
  7  |     // 1. Open /demo
  8  |     await page.goto("/demo");
> 9  |     await expect(page).toHaveTitle(/VoxDesk AI/i);
     |                        ^ Error: expect(page).toHaveTitle(expected) failed
  10 | 
  11 |     // 2. Select Organization Preset (HEALTHCARE)
  12 |     const healthcareBtn = page.locator("button:has-text('Apex Dental')");
  13 |     if (await healthcareBtn.isVisible()) {
  14 |       await healthcareBtn.click();
  15 |     }
  16 | 
  17 |     // 3. Select Scenario (BOOKING)
  18 |     const bookingScenarioBtn = page.locator("button:has-text('BOOKING')");
  19 |     if (await bookingScenarioBtn.isVisible()) {
  20 |       await bookingScenarioBtn.click();
  21 |     }
  22 | 
  23 |     // 4. Start Demo Call Session
  24 |     const startCallBtn = page.locator(
  25 |       "button:has-text('Start Interactive Call Demo')",
  26 |     );
  27 |     if (await startCallBtn.isVisible()) {
  28 |       await startCallBtn.click();
  29 |     }
  30 | 
  31 |     // 5. Verify Active Console is rendered
  32 |     await page.waitForTimeout(1000);
  33 |     const consoleHeading = page.locator("text=Live Call");
  34 |     if (await consoleHeading.isVisible()) {
  35 |       await expect(consoleHeading).toBeVisible();
  36 |     }
  37 | 
  38 |     // 6. Submit Manual Input Turn
  39 |     const textInput = page.locator("input[placeholder*='Type your response']");
  40 |     if (await textInput.isVisible()) {
  41 |       await textInput.fill(
  42 |         "I would like to schedule a dental checkup consultation.",
  43 |       );
  44 |       await page.keyboard.press("Enter");
  45 |       await page.waitForTimeout(1500);
  46 |     }
  47 | 
  48 |     // 7. End Call and Review Receipt
  49 |     const endCallBtn = page.locator(
  50 |       "button:has-text('End Call & Review Outcome')",
  51 |     );
  52 |     if (await endCallBtn.isVisible()) {
  53 |       await endCallBtn.click();
  54 |     }
  55 | 
  56 |     // 8. Verify Outcome Receipt
  57 |     const receiptBanner = page.locator("text=Call Outcome Receipt");
  58 |     if (await receiptBanner.isVisible()) {
  59 |       await expect(receiptBanner).toBeVisible();
  60 |     }
  61 |   });
  62 | 
  63 |   test("should load authenticated dashboard routes cleanly", async ({
  64 |     page,
  65 |   }) => {
  66 |     await page.goto("/dashboard/calls");
  67 |     await expect(page).toHaveURL(/\/dashboard\/calls|\/login/);
  68 |   });
  69 | });
  70 | 
```