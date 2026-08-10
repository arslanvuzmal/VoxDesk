import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);
const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const localBaseUrl = 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: externalBaseUrl || localBaseUrl,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: isCI ? 'npm run start' : 'npm run dev',
        url: localBaseUrl,
        reuseExistingServer: !isCI,
        timeout: 120000,
      },
});
