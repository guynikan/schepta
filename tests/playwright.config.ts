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
  },
  projects: [
    {
      name: 'react',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
      },
    },
    {
      name: 'material-ui',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3001',
      },
    },
    {
      name: 'chakra-ui',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3002',
      },
    },
    {
      name: 'vue',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3010',
      },
    },
    {
      name: 'vue-vuetify',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3011',
      },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter examples-react dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'pnpm --filter examples-react-material-ui dev',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'pnpm --filter examples-react-chakra-ui dev',
      url: 'http://localhost:3002',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'pnpm --filter examples-vue dev',
      url: 'http://localhost:3010',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'pnpm --filter examples-vue-vuetify dev',
      url: 'http://localhost:3011',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
});

