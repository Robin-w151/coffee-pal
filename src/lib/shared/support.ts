import { browser } from '$app/environment';

export function isViewTransitionAvailable(): boolean {
  return browser && 'startViewTransition' in document;
}
