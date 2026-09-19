import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4173', ...devices['Desktop Chrome'], trace: 'on-first-retry' },
  webServer: { command: 'pnpm dev', url: 'http://127.0.0.1:4173', reuseExistingServer: true, timeout: 120_000 },
});
