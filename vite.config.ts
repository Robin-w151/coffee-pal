import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      strategies: 'injectManifest',
      manifest: {
        name: 'Coffee Pal',
        short_name: 'Coffee Pal',
        description: 'Collection of tools related to preparing coffee.',
        categories: [''],
        id: '/',
        start_url: '/',
        lang: 'en-US',
        display: 'standalone',
        theme_color: '#000000',
        background_color: '#000000',
      },
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
