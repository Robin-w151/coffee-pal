import type { Route } from '$lib/models/route';

export function isRouteSelected(route: Route, pathname?: string): boolean {
  if (!pathname) {
    return false;
  }

  if (route.match) {
    return route.match.test(pathname);
  }

  return route.href === pathname;
}
