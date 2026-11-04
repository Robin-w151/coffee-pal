import { browser } from '$app/env';

export function isViewTransitionAvailable(): boolean {
  return browser && 'startViewTransition' in document;
}
