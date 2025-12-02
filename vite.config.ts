import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import dotenv from 'dotenv-flow';
import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import manifest from './src/assets/manifest';

dotenv.config({ silent: true });

export default defineConfig({
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version),
    'import.meta.env.APP_COMMIT_HASH': JSON.stringify(getCommitHash()),
    'process.env.NODE_ENV': '"production"',
  },
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      strategies: 'injectManifest',
      manifest,
      minify: false,
      devOptions: {
        enabled: true,
        suppressWarnings: process.env.SUPPRESS_WARNING === 'true',
        type: 'module',
        navigateFallback: '/',
      },
    }),
  ],
  build: {
    sourcemap: true,
  },
  server: {
    host: '0.0.0.0',
  },
});

function getCommitHash(): string {
  return execSync('git rev-parse --short=7 HEAD').toString().trim();
}
