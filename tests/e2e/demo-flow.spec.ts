import { test, expect } from "@playwright/test";

test.describe("VoxDesk AI /demo Route Regression Suite", () => {
  test("should render /demo page without client-side exceptions or missing ElevenLabs provider errors", async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    const consoleErrors: string[] = [];

    page.on("pageerror", (error) => {
      console.error("[PLAYWRIGHT_PAGE_ERROR]:", error);
      pageErrors.push(error);
    });

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.error("[PLAYWRIGHT_CONSOLE_ERROR]:", msg.text());
        consoleErrors.push(msg.text());
      }
    });

    // 1. Open /demo
    await page.goto("/demo");
    await page.waitForLoadState("domcontentloaded");

    // 2. Assert no page errors
    expect(pageErrors).toHaveLength(0);

    // 3. Assert no generic Next.js crash screen
    const appErrorHeading = page.getByText("Application error: a client-side exception has occurred");
    await expect(appErrorHeading).not.toBeVisible();

    // 4. Assert header and call button are visible
    await expect(page.getByText("Live Voice Agent Sandbox")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Start Live Voice Call/i })
    ).toBeVisible();

    // 5. Assert no missing ConversationProvider console error
    const providerError = consoleErrors.some((err) =>
      err.includes("useConversation must be used within a ConversationProvider")
    );
    expect(providerError).toBe(false);
  });

  test("should load authenticated dashboard routes cleanly", async ({
    page,
  }) => {
    await page.goto("/dashboard/calls");
    await expect(page).toHaveURL(/\/dashboard\/calls|\/login/);
  });
});
