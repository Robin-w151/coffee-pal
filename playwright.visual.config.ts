import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://localhost:4173';

/**
 * Screenshot suite, local only (snapshots are taken on macOS). Run via `pnpm test:visual`,
 * which builds first: the web server only serves the existing build.
 */
export default defineConfig({
  testDir: './tests/visual',
  testMatch: '**/*.visual.ts',
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
  fullyParallel: true,
  // The JSON report tells scripts/visual-review.js which tests failed before their screenshot.
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/visual-results.json' }],
  ],
  use: {
    baseURL,
    locale: 'en-US',
    timezoneId: 'Europe/Vienna',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'phone',
      use: { ...devices['Desktop Chrome'], viewport: { width: 576, height: 768 } },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
  expect: {
    timeout: 30_000,
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.01 },
  },
  webServer: {
    command: 'pnpm exec vite preview --port 4173 --strictPort',
    url: baseURL,
    reuseExistingServer: false,
  },
});
