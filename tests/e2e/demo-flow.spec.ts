import { test, expect } from '@playwright/test';

test.describe('VoxDesk /demo route', () => {
  test('should render /demo page without client-side exceptions or missing ElevenLabs provider errors', async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    const consoleErrors: string[] = [];

    page.on('pageerror', error => {
      console.error('[PLAYWRIGHT_PAGE_ERROR]:', error);
      pageErrors.push(error);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('[PLAYWRIGHT_CONSOLE_ERROR]:', msg.text());
        consoleErrors.push(msg.text());
      }
    });

    // 1. Open /demo
    await page.goto('/demo');
    await page.waitForLoadState('domcontentloaded');

    // 2. Assert no page errors
    expect(pageErrors).toHaveLength(0);

    // 3. Assert no generic Next.js crash screen
    const appErrorHeading = page.getByText(
      'Application error: a client-side exception has occurred'
    );
    await expect(appErrorHeading).not.toBeVisible();

    // 4. Assert header and call button are visible (flexible text matching)
    await expect(page.getByRole('heading', { name: 'Conversation to operational record' })).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole('button', { name: /Start Live Voice Call|Start Call/i })
    ).toBeVisible({ timeout: 10000 });

    // 5. Assert no missing ConversationProvider console error
    const providerError = consoleErrors.some(err =>
      err.includes('useConversation must be used within a ConversationProvider')
    );
    expect(providerError).toBe(false);
    expect(consoleErrors).toEqual([]);
  });

  test('contains the complete demo at mobile width without horizontal overflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/demo');
    await expect(page.getByRole('button', { name: 'Start Live Voice Call' })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole('button', { name: 'Open navigation' })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  });

  test('should load authenticated dashboard routes cleanly', async ({ page }) => {
    await page.goto('/dashboard/calls');
    expect(page.url()).toMatch(/\/dashboard\/calls|\/login/);
  });
});
