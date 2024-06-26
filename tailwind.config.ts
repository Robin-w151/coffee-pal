import { skeleton } from '@skeletonlabs/tw-plugin';
import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';
import { join } from 'path';
import type { Config } from 'tailwindcss/types/config';
import { coffeeTheme } from './theme';
import { screens } from './src/lib/config/screens';

export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}'),
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens,
    },
  },
  plugins: [
    forms,
    skeleton({
      themes: {
        custom: [coffeeTheme],
      },
    }),
    containerQueries,
  ],
} satisfies Config;
