import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';
import type { Config } from 'tailwindcss/types/config';
import { screens } from './src/lib/config/screens';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens,
    },
  },
  plugins: [forms, containerQueries],
} satisfies Config;
