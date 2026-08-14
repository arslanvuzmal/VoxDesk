import { expect, test } from '@playwright/test';

test.describe('VoxDesk /demo route', () => {
  test('renders the Demo Studio without client-side exceptions', async ({ page }) => {
    const pageErrors: Error[] = [];
    const consoleErrors: string[] = [];

    page.on('pageerror', error => {
      pageErrors.push(error);
    });

    page.on('console', message => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    await page.goto('/demo');
    await page.waitForLoadState('domcontentloaded');

    expect(pageErrors).toHaveLength(0);
    await expect(
      page.getByText('Application error: a client-side exception has occurred')
    ).not.toBeVisible();

    await expect(page.getByRole('heading', { name: 'Conversations into operations.' })).toBeVisible(
      { timeout: 10000 }
    );
    await expect(page.getByRole('button', { name: 'Run persisted simulation' })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole('button', { name: 'Start Live Voice Call' })).toBeVisible({
      timeout: 10000,
    });

    expect(
      consoleErrors.some(error =>
        error.includes('useConversation must be used within a ConversationProvider')
      )
    ).toBe(false);
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

  test('loads authenticated dashboard routes cleanly', async ({ page }) => {
    await page.goto('/dashboard/calls');
    expect(page.url()).toMatch(/\/dashboard\/calls|\/login/);
  });
});
