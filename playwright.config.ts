import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv-flow';

dotenv.config({ silent: true });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: process.env.TEST_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 576, height: 768 } },
    },
  ],
  expect: {
    timeout: 30_000,
  },
  retries: 1,
});
