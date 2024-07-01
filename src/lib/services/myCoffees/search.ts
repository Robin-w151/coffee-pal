import type {
  ActiveCoffeeEntry,
  MyCoffeesSearchState,
  MyCoffeesSort,
  MyCoffeesSortDirection,
} from '$lib/models/myCoffees';
import { buildFuseQuery } from '$lib/services/search/fuzzy';
import Fuse, { type IFuseOptions } from 'fuse.js';

const FUSE_OPTIONS = {
  threshold: 0.4,
  ignoreLocation: true,
  findAllMatches: true,
  keys: [
    {
      name: 'name',
      weight: 3,
    },
    {
      name: 'origin',
      weight: 2,
    },
    {
      name: 'variety',
      weight: 2,
    },
    {
      name: 'process',
      weight: 2,
    },
    {
      name: 'roaster',
      weight: 2,
    },
    {
      name: 'trader',
      weight: 2,
    },
    {
      name: 'aromas',
      weight: 1,
    },
    {
      name: 'description',
      weight: 2,
    },
  ],
} satisfies IFuseOptions<ActiveCoffeeEntry>;

export function sortOrSearch(
  entries: Array<ActiveCoffeeEntry>,
  searchState: MyCoffeesSearchState,
): Array<ActiveCoffeeEntry> {
  if (searchState.filter) {
    return search(entries, searchState.filter);
  } else {
    return sort(entries, searchState.sort ?? 'updated_at', searchState.sortDirection ?? 'desc');
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
  sort: MyCoffeesSort = 'updated_at',
  sortDirection: MyCoffeesSortDirection = 'desc',
): Array<ActiveCoffeeEntry> {
  const reverse = (entries: Array<ActiveCoffeeEntry>) =>
    sortDirection === 'asc' ? entries : entries.reverse();
  return reverse(
    entries.sort((e1: ActiveCoffeeEntry, e2: ActiveCoffeeEntry) => {
      switch (sort) {
        case 'name_origin':
          return `${e1.name}-${e1.origin ?? ''}`.localeCompare(`${e2.name}-${e2.origin ?? ''}`);
        case 'updated_at':
          return e1.updatedAt.localeCompare(e2.updatedAt);
      }
    }),
  );
}
