import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import manifest from './src/assets/manifest';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { execSync } from 'child_process';

export default defineConfig({
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version),
    'import.meta.env.APP_COMMIT_HASH': JSON.stringify(getCommitHash()),
    'process.env.NODE_ENV': '"production"',
  },
  plugins: [
    sveltekit(),
    purgeCss(),
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
