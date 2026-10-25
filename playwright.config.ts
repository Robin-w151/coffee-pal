import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv-flow';

dotenv.config({ silent: true });

const isCI = !!process.env['CI'];
const useLocalPreview = process.env['TEST_LOCAL_PREVIEW'] === '1';
const localPreviewURL = 'http://localhost:4173';
const baseURL = useLocalPreview
  ? localPreviewURL
  : (process.env['TEST_BASE_URL'] ?? 'http://localhost:5173');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: useLocalPreview ? [['html', { open: 'never' }], ['list']] : 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    extraHTTPHeaders: {
      'x-vercel-skip-toolbar': '1',
    },
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
  retries: isCI ? 2 : 0,
  ...(useLocalPreview && {
    webServer: {
      command: 'corepack pnpm exec vite preview --port 4173 --strictPort',
      url: localPreviewURL,
      reuseExistingServer: false,
    },
  }),
});
