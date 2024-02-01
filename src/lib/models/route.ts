import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import type { IconResource } from 'vite-plugin-pwa';

export interface Route {
  href: string;
  label: string;
  icon: IconDefinition;
  shortcutIcon: IconResource;
}
