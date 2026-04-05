import { defineConfig } from '@playwright/test';

const isLocal = !process.env.BASE_URL || process.env.BASE_URL.includes('localhost');

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'test-results.json' }]],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3456',
    screenshot: 'off',
    trace: 'off',
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'desktop',
      use: { viewport: { width: 1280, height: 720 } },
    },
  ],
  ...(isLocal
    ? {
        webServer: {
          command: 'npx next dev -p 3456',
          port: 3456,
          timeout: 120000,
          reuseExistingServer: true,
        },
      }
    : {}),
});
