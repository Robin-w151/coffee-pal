import adapterAuto from '@sveltejs/adapter-auto';
import adapterBun from '@sveltejs/adapter-bun';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { withPwa } from '@vite-pwa/sveltekit';
import dotenv from 'dotenv-flow';
import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import manifest from './src/assets/manifest.ts';

dotenv.config({ silent: true });

const useAdapterBun = process.env['USE_ADAPTER_BUN'] === 'true';

export default defineConfig({
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version),
    'import.meta.env.APP_COMMIT_HASH': JSON.stringify(getCommitHash()),
    'process.env.NODE_ENV': '"production"',
  },
  plugins: [
    tailwindcss(),
    // withPwa wraps sveltekit(): the first argument is the SvelteKit (and vite-plugin-svelte) config.
    withPwa(
      {
        adapter: useAdapterBun ? adapterBun() : adapterAuto(),
        preprocess: vitePreprocess(),
        inspector: true,
        onwarn: (warning, handler) => {
          if (warning.code === 'state_referenced_locally') {
            return;
          }

          handler(warning);
        },
      },
      {
        strategies: 'buildSW',
        // SvelteKit registers src/service-worker.ts itself, as before.
        injectRegister: false,
        buildSW: { swSrc: 'src/service-worker.ts' },
        manifest,
        minify: false,
        devOptions: {
          enabled: true,
          suppressWarnings: process.env.SUPPRESS_WARNING === 'true',
          type: 'module',
          navigateFallback: '/',
        },
      },
    ),
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
