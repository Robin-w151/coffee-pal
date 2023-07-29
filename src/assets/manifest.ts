import type { ManifestOptions } from 'vite-plugin-pwa';

export default {
  name: 'Coffee Pal',
  short_name: 'Coffee Pal',
  description: 'Collection of tools related to preparing coffee.',
  categories: ['productivity', 'utilities'],
  id: '/',
  start_url: '/',
  lang: 'en-US',
  display: 'standalone',
  orientation: 'any',
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
  screenshots: [],
  shortcuts: [],
} satisfies Partial<ManifestOptions>;