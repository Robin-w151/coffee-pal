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
        categories: ['productivity', 'utilities'],
        id: '/',
        start_url: '/',
        lang: 'en-US',
        display: 'standalone',
        theme_color: '#3b3d91',
        background_color: '#3b3d91',
        icons: [
          {
            src: 'icons/icon192_any.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon192_maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icons/icon512_any.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon512_maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
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
