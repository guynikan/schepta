import { defineConfig, devices } from '@playwright/test';

const port = 4173;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],
  timeout: 30 * 1000, // 30 seconds per test
  use: {
    trace: 'on-first-retry',
    actionTimeout: 10 * 1000, // 10 seconds for actions
    navigationTimeout: 15 * 1000, // 15 seconds for navigation
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // Output folders for test artifacts
  outputDir: '../test-results',
  snapshotDir: '../test-screenshots',
  webServer: {
    command: `pnpm --filter docs exec vitepress preview --host 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'react',
      testMatch: '**/*react.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `${baseURL}/en-US/showcases/react`,
      },
    },
    {
      name: 'vue',
      testMatch: '**/*vue.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `${baseURL}/en-US/showcases/vue`,
      },
    },
    {
      name: 'vanilla',
      testMatch: '**/*vanilla.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `${baseURL}/en-US/showcases/vanilla`,
      },
    },
  ],
});

