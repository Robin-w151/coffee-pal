import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import manifest from './src/assets/manifest';

export default defineConfig({
  define: {
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
  server: {
    host: '0.0.0.0',
  },
});
