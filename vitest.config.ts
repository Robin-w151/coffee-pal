import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

// Reuses the app's Vite config, so the SvelteKit options inlined there apply to tests too.
export default mergeConfig(
  viteConfig,
  defineConfig({
    // Browser builds of esm-env, runed and $app/env, so stores see the jsdom window.
    resolve: { conditions: ['browser'] },
    test: {
      include: ['src/**/*.spec.ts'],
    },
  }),
);
