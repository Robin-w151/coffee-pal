import { join } from 'path';
import skeleton from '@skeletonlabs/skeleton/tailwind/skeleton.cjs';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}'),
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [...skeleton()],
};
