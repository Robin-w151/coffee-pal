import adapterAuto from '@sveltejs/adapter-auto';
import adapterBun from 'svelte-adapter-bun';
import { vitePreprocess } from '@sveltejs/kit/vite';
import { resolve } from 'path';

const useAdapterBun = process.env['USE_ADAPTER_BUN'] === 'true';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: getAdapter(),
    alias: {
      $assets: resolve('./src/assets'),
      $lib: resolve('./src/lib'),
    },
  },
};

export default config;

function getAdapter() {
  if (useAdapterBun) {
    return adapterBun();
  }

  return adapterAuto();
}
