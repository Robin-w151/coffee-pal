import { browser } from '$app/environment';
import type { CoffeeEntry, MyCoffeesSearchState } from '$lib/models/myCoffees';
import { wrap } from 'comlink';
import { sortOrSearch as sortOrSearchImpl } from './search';

const worker: any = browser
  ? import('./worker?worker').then((w) => wrap(new w.default()))
  : undefined;

export async function sortOrSearch(
  entries: Array<CoffeeEntry>,
  search: MyCoffeesSearchState,
): Promise<Array<CoffeeEntry>> {
  if (browser) {
    return (await worker).sortOrSearch(entries, search);
  } else {
    return sortOrSearchImpl(entries, search);
  }
}
