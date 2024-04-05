import type { CachedSearchResult } from '$lib/models/cachedSearch';
import type {
  ActiveCoffeeEntry,
  MyCoffeesSearchState,
  MyCoffeesWorker,
} from '$lib/models/myCoffees';
import { expose } from 'comlink';
import { sortOrSearch as sortOrSearchImpl } from './search';
import { MY_COFFEES_PAGE_SIZE } from '$lib/config/myCoffees';

let data: Array<ActiveCoffeeEntry> = [];

function sortOrSearch(
  entries: Array<ActiveCoffeeEntry>,
  search: MyCoffeesSearchState,
): CachedSearchResult<ActiveCoffeeEntry> {
  data = sortOrSearchImpl(entries, search);

  return {
    data: data.slice(0, MY_COFFEES_PAGE_SIZE),
    totalEntries: data.length,
  };
}

function loadPage(index: number, count: number): Array<ActiveCoffeeEntry> {
  return data.slice(index, index + count);
}

expose({
  sortOrSearch,
  loadPage,
} satisfies MyCoffeesWorker);
