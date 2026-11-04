import adapterAuto from '@sveltejs/adapter-auto';
import adapterBun from 'svelte-adapter-bun';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'node:path';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import dotenv from 'dotenv-flow';
import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import manifest from './src/assets/manifest';

dotenv.config({ silent: true });

const useAdapterBun = process.env['USE_ADAPTER_BUN'] === 'true';

function getAdapter() {
  if (useAdapterBun) {
    return adapterBun();
  }

  return adapterAuto();
}

export default defineConfig({
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version),
    'import.meta.env.APP_COMMIT_HASH': JSON.stringify(getCommitHash()),
    'process.env.NODE_ENV': '"production"',
  },
  plugins: [
    tailwindcss(),
    sveltekit({
      preprocess: vitePreprocess(),
      vitePlugin: {
        inspector: true,
        onwarn: (warning, handler) => {
          if (warning.code === 'state_referenced_locally') {
            return;
          }

          handler(warning);
        },
      },
      adapter: getAdapter(),
      alias: { $assets: resolve('./src/assets'), $lib: resolve('./src/lib') },
    }),

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
