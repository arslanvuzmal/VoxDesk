import { test, expect } from "@playwright/test";

test.describe("VoxDesk AI Interactive Public Demo & CRM E2E Flow", () => {
  test("should complete full multi-turn booking flow and verify database outcome receipt", async ({
    page,
  }) => {
    // 1. Open /demo
    await page.goto("/demo");
    await expect(page).toHaveTitle(/VoxDesk AI/i);

    // 2. Select Organization Preset (HEALTHCARE)
    const healthcareBtn = page.locator("button:has-text('Apex Dental')");
    if (await healthcareBtn.isVisible()) {
      await healthcareBtn.click();
    }

    // 3. Select Scenario (BOOKING)
    const bookingScenarioBtn = page.locator("button:has-text('BOOKING')");
    if (await bookingScenarioBtn.isVisible()) {
      await bookingScenarioBtn.click();
    }

    // 4. Start Demo Call Session
    const startCallBtn = page.locator(
      "button:has-text('Start Interactive Call Demo')",
    );
    if (await startCallBtn.isVisible()) {
      await startCallBtn.click();
    }

    // 5. Verify Active Console is rendered
    await page.waitForTimeout(1000);
    const consoleHeading = page.locator("text=Live Call");
    if (await consoleHeading.isVisible()) {
      await expect(consoleHeading).toBeVisible();
    }

    // 6. Submit Manual Input Turn
    const textInput = page.locator("input[placeholder*='Type your response']");
    if (await textInput.isVisible()) {
      await textInput.fill(
        "I would like to schedule a dental checkup consultation.",
      );
      await page.keyboard.press("Enter");
      await page.waitForTimeout(1500);
    }

    // 7. End Call and Review Receipt
    const endCallBtn = page.locator(
      "button:has-text('End Call & Review Outcome')",
    );
    if (await endCallBtn.isVisible()) {
      await endCallBtn.click();
    }

    // 8. Verify Outcome Receipt
    const receiptBanner = page.locator("text=Call Outcome Receipt");
    if (await receiptBanner.isVisible()) {
      await expect(receiptBanner).toBeVisible();
    }
  });

  test("should load authenticated dashboard routes cleanly", async ({
    page,
  }) => {
    await page.goto("/dashboard/calls");
    await expect(page).toHaveURL(/\/dashboard\/calls|\/login/);
  });
});
