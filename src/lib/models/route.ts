import type { RouteId } from '$app/types';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import type { IconResource } from '@unplugin-pwa/core';

export interface Route {
  /** A route without params, so `resolve(href)` needs no params. */
  href: Exclude<RouteId, `${string}[${string}`>;
  label: string;
  icon: IconDefinition;
  shortcutIcon: IconResource;
  match?: RegExp;
}
