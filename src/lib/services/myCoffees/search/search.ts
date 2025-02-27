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
      name: 'altitude',
      weight: 1,
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
  const compareWithUndefinedLast = <T>(
    a: T | undefined,
    b: T | undefined,
    compareFn: (a: T, b: T) => number,
  ): number => {
    if (a === undefined && b === undefined) {
      return 0;
    } else if (a === undefined) {
      return 1;
    } else if (b === undefined) {
      return -1;
    } else {
      const result = compareFn(a, b);
      return sortDirection === 'asc' ? result : -result;
    }
  };

  return entries.toSorted((e1: ActiveCoffeeEntry, e2: ActiveCoffeeEntry) => {
    switch (sort) {
      case 'name_origin': {
        const nameOrigin1 = `${e1.name}-${e1.origin ?? ''}`;
        const nameOrigin2 = `${e2.name}-${e2.origin ?? ''}`;
        if (sortDirection === 'asc') {
          return nameOrigin1.localeCompare(nameOrigin2);
        } else {
          return nameOrigin2.localeCompare(nameOrigin1);
        }
      }
      case 'altitude': {
        return compareWithUndefinedLast(e1.altitude, e2.altitude, (a, b) => a - b);
      }
      case 'rating': {
        const rating1 = e1.rating ?? 0;
        const rating2 = e2.rating ?? 0;
        return sortDirection === 'asc' ? rating1 - rating2 : rating2 - rating1;
      }
      case 'updated_at': {
        if (sortDirection === 'asc') {
          return e1.updatedAt.localeCompare(e2.updatedAt);
        } else {
          return e2.updatedAt.localeCompare(e1.updatedAt);
        }
      }
    }
  });
}
