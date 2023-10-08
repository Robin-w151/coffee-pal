import type { ManifestOptions } from 'vite-plugin-pwa';
import { routes } from '../lib/config/routes';

export default {
  name: 'Coffee Pal',
  short_name: 'Coffee Pal',
  description: 'Collection of tools related to preparing coffee.',
  categories: ['productivity', 'utilities'],
  id: '/',
  start_url: '/',
  lang: 'en-US',
  dir: 'ltr',
  display: 'standalone',
  display_override: ['window-controls-overlay'],
  orientation: 'any',
  theme_color: '#081638',
  background_color: '#dbdee7',
  handle_links: 'preferred',
  launch_handler: {
    client_mode: ['focus-existing', 'auto'],
  },
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
  screenshots: [
    {
      src: 'screenshots/journal.png',
      sizes: '750x1334',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Brewing Journal',
    },
    {
      src: 'screenshots/my-coffees.png',
      sizes: '750x1334',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'My Coffees',
    },
    {
      src: 'screenshots/calculator.png',
      sizes: '750x1334',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Brewing Calculator',
    },
  ],
  shortcuts: routes.map(({ href, label, shortcutIcon }) => ({
    name: label,
    url: href,
    icons: shortcutIcon ? [shortcutIcon] : undefined,
  })),
  edge_side_panel: {
    preferred_width: 660,
  },
} satisfies Partial<ManifestOptions>;
