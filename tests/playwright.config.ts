import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
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
    command: 'cd ../docs && pnpm dev --port 5174',
    url: 'http://localhost:5174',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
  projects: [
    {
      name: 'react',
      testMatch: '**/*react.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5174/en-US/showcases/react',
      },
    },
    {
      name: 'vue',
      testMatch: '**/*vue.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5174/en-US/showcases/vue',
      },
    },
    {
      name: 'vanilla',
      testMatch: '**/*vanilla.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5174/en-US/showcases/vanilla',
      },
    },
    {
      name: 'menu',
      testMatch: '**/*menu.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5174/en-US/showcases/menu',
      },
    },
    {
      name: 'table',
      testMatch: '**/*table.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5174/en-US/showcases/table',
      },
    },
    {
      name: 'tabs',
      testMatch: '**/*tabs.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5174/en-US/showcases/tabs',
      },
    },
    {
      name: 'modal',
      testMatch: '**/*modal.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5174/en-US/showcases/modal',
      },
    },
    {
      name: 'layout',
      testMatch: '**/*layout.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5174/en-US/showcases/layout',
      },
    },
    {
      // The a11y suite navigates across several showcases, so its baseURL is
      // the docs root rather than a single showcase page.
      name: 'a11y',
      testMatch: '**/*a11y.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5174',
      },
    },
  ],
});
