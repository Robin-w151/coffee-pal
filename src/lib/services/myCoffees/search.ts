import {
  isDeletedCoffeeEntry,
  type CoffeeEntry,
  type MyCoffeesSearchState,
  type MyCoffeesSort,
} from '$lib/models/myCoffees';
import { buildFuseQuery } from '$lib/utils/search/fuzzy';
import Fuse from 'fuse.js';

const FUSE_OPTIONS = {
  threshold: 0.4,
  ignoreLocation: true,
  findAllMatches: true,
  keys: ['name', 'origin', 'trader', 'aromas', 'description'],
} satisfies Fuse.IFuseOptions<CoffeeEntry>;

export function sortOrSearch(
  entries: Array<CoffeeEntry>,
  searchState: MyCoffeesSearchState,
): Array<CoffeeEntry> {
  if (searchState.filter) {
    return search(entries, searchState.filter);
  } else {
    return sort(entries, searchState.sort ?? 'asc');
  }
}

export function search(entries: Array<CoffeeEntry>, filter?: string | null): Array<CoffeeEntry> {
  if (filter) {
    const filterQuery = buildFuseQuery(filter, FUSE_OPTIONS.keys);
    const fuse = new Fuse(entries, FUSE_OPTIONS);
    return fuse.search(filterQuery).map((result) => result.item);
  } else {
    return entries;
  }
}

export function sort(entries: Array<CoffeeEntry>, sort: MyCoffeesSort = 'asc'): Array<CoffeeEntry> {
  const reverse = (entries: Array<CoffeeEntry>) => (sort === 'asc' ? entries : entries.reverse());
  return reverse(
    entries.sort((e1: CoffeeEntry, e2: CoffeeEntry) => {
      if (isDeletedCoffeeEntry(e1) && isDeletedCoffeeEntry(e2)) {
        return 0;
      } else if (isDeletedCoffeeEntry(e1)) {
        return 1;
      } else if (isDeletedCoffeeEntry(e2)) {
        return -1;
      } else {
        return `${e1.name}-${e1.origin ?? ''}`.localeCompare(`${e2.name}-${e2.origin ?? ''}`);
      }
    }),
  );
}
