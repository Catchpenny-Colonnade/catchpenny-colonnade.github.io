import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.js',
  webServer: {
    command: 'npx http-server -p 8000',
    port: 8000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
