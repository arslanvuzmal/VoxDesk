import { expect, test } from '@playwright/test';

test.describe('public platform architecture', () => {
  test('explains the system boundary and authorized execution path', async ({ page }) => {
    await page.goto('/platform');

    await expect(
      page.getByRole('heading', {
        name: 'Conversations become controlled business operations.',
      })
    ).toBeVisible();
    await expect(page.getByText('The model cannot directly write to the CRM.')).toBeVisible();
    await expect(page.getByText('Voice provider boundaries')).toBeVisible();
    await expect(page.getByText('Activation required').first()).toBeVisible();
  });

  test('documents the customer-service and optional lead integration model', async ({ page }) => {
    await page.goto('/operations');

    await expect(
      page.getByRole('heading', {
        name: 'Run customer operations from the conversation outward.',
      })
    ).toBeVisible();
    await expect(page.getByText('LeadPilot / Sales Qualifier')).toBeVisible();
    await expect(page.getByText('ADAPTER NOT CONNECTED')).toBeVisible();
    await expect(page.getByText('Cases, queues, and SLA')).toBeVisible();
    await expect(page.getByText('PLANNED').first()).toBeVisible();
  });
});
