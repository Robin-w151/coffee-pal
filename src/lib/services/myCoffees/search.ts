import type { ActiveCoffeeEntry, MyCoffeesSearchState, MyCoffeesSort } from '$lib/models/myCoffees';
import { buildFuseQuery } from '$lib/utils/search/fuzzy';
import Fuse from 'fuse.js';

const FUSE_OPTIONS = {
  threshold: 0.4,
  ignoreLocation: true,
  findAllMatches: true,
  keys: ['name', 'origin', 'trader', 'aromas', 'description'],
} satisfies Fuse.IFuseOptions<ActiveCoffeeEntry>;

export function sortOrSearch(
  entries: Array<ActiveCoffeeEntry>,
  searchState: MyCoffeesSearchState,
): Array<ActiveCoffeeEntry> {
  if (searchState.filter) {
    return search(entries, searchState.filter);
  } else {
    return sort(entries, searchState.sort ?? 'asc');
  }
}

export function search(
  entries: Array<ActiveCoffeeEntry>,
  filter?: string | null,
): Array<ActiveCoffeeEntry> {
  if (filter) {
    const filterQuery = buildFuseQuery(filter, FUSE_OPTIONS.keys);
    const fuse = new Fuse(entries, FUSE_OPTIONS);
    return fuse.search(filterQuery).map((result) => result.item);
  } else {
    return entries;
  }
}

export function sort(
  entries: Array<ActiveCoffeeEntry>,
  sort: MyCoffeesSort = 'asc',
): Array<ActiveCoffeeEntry> {
  const reverse = (entries: Array<ActiveCoffeeEntry>) =>
    sort === 'asc' ? entries : entries.reverse();
  return reverse(
    entries.sort((e1: ActiveCoffeeEntry, e2: ActiveCoffeeEntry) => {
      return `${e1.name}-${e1.origin ?? ''}`.localeCompare(`${e2.name}-${e2.origin ?? ''}`);
    }),
  );
}
