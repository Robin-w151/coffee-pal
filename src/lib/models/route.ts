import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export interface Route {
  href: string;
  label: string;
  icon: IconDefinition;
  shortcutIcon: Record<string, any>;
}
