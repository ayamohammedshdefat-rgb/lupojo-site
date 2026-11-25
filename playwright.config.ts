import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

/**
 * E2E runs against the Firebase emulators with seeded data (see `npm run test:e2e`).
 * The app is built and started in production mode so hydration and caching match deploys.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL,
    locale: 'ar-JO',
    timezoneId: 'Asia/Amman',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 390, height: 844 },
        browserName: 'chromium',
      },
    },
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: process.env.E2E_SKIP_BUILD ? `npm run start -- -p ${PORT}` : `npm run build && npm run start -- -p ${PORT}`,
        url: baseURL,
        timeout: 300_000,
        reuseExistingServer: !process.env.CI,
        env: { NEXT_PUBLIC_USE_EMULATORS: 'true' },
      },
});
