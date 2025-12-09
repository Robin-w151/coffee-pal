import adapterAuto from '@sveltejs/adapter-auto';
import adapterBun from 'svelte-adapter-bun';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

const useAdapterBun = process.env['USE_ADAPTER_BUN'] === 'true';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: getAdapter(),
    alias: {
      $assets: resolve('./src/assets'),
      $lib: resolve('./src/lib'),
    },
  },
  vitePlugin: {
    inspector: true,
  },
  onwarn: (warning, handler) => {
    if (warning.code === 'state_referenced_locally') {
      return;
    }

    handler(warning);
  },
};

export default config;

function getAdapter() {
  if (useAdapterBun) {
    return adapterBun();
  }

  return adapterAuto();
}
