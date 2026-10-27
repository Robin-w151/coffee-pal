import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  // Browser builds of esm-env, runed and $app/environment, so stores see the jsdom window.
  resolve: { conditions: ['browser'] },
  test: {
    include: ['src/**/*.spec.ts'],
  },
});
