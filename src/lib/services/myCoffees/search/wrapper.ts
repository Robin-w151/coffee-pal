import { browser } from '$app/environment';
import type { CachedSearchResult } from '$lib/models/cachedSearch';
import type { ActiveCoffeeEntry, MyCoffeesSearchState } from '$lib/models/myCoffees';
import { wrap } from 'comlink';

const worker: any = browser ? wrap(new (await import('./worker?worker')).default()) : undefined;

export async function sortOrSearch(
  entries: Array<ActiveCoffeeEntry>,
  search: MyCoffeesSearchState,
): Promise<CachedSearchResult<ActiveCoffeeEntry>> {
  if (browser) {
    return worker.sortOrSearch(entries, search);
  } else {
    return { data: [], totalEntries: 0 };
  }
}

export async function quickSearch(
  entries: Array<ActiveCoffeeEntry>,
  filter?: string,
): Promise<Array<ActiveCoffeeEntry>> {
  if (browser) {
    return worker.quickSearch(entries, filter);
  } else {
    return [];
  }
}

export async function loadPage(index: number, count: number): Promise<Array<ActiveCoffeeEntry>> {
  if (browser) {
    return worker.loadPage(index, count);
  } else {
    return [];
  }
}
