import type {
  ActiveJournalEntry,
  JournalSearchState,
  JournalSort,
  JournalSortDirection,
} from '$lib/models/journal';
import { getCoffeeLabel } from '$lib/models/myCoffees';
import { buildFuseQuery } from '$lib/services/search/fuzzy';
import Fuse, { type IFuseOptions } from 'fuse.js';

const FUSE_OPTIONS = {
  threshold: 0.4,
  ignoreLocation: true,
  findAllMatches: true,
  keys: [
    {
      name: 'method',
      weight: 3,
    },
    {
      name: 'water',
      weight: 1,
    },
    {
      name: 'waterTemperature',
      weight: 1,
    },
    {
      name: 'coffee',
      weight: 1,
    },
    {
      name: 'coffeeType',
      weight: 3,
    },
    {
      name: 'coffeeType.name',
      weight: 2,
    },
    {
      name: 'coffeeType.origin',
      weight: 2,
    },
    {
      name: 'coffeeType.variety',
      weight: 2,
    },
    {
      name: 'coffeeType.process',
      weight: 2,
    },
    {
      name: 'coffeeType.roaster',
      weight: 2,
    },
    {
      name: 'coffeeType.trader',
      weight: 2,
    },
    {
      name: 'coffeeType.aromas',
      weight: 1,
    },
    {
      name: 'coffeeType.description',
      weight: 2,
    },
    {
      name: 'grindSettings',
      weight: 1,
    },
    {
      name: 'description',
      weight: 2,
    },
  ],
} satisfies IFuseOptions<ActiveJournalEntry>;

export function sortOrSearch(
  entries: Array<ActiveJournalEntry>,
  searchState: JournalSearchState,
): Array<ActiveJournalEntry> {
  if (searchState.filter) {
    return search(entries, searchState.filter);
  } else {
    return sort(entries, searchState.sort ?? 'updated_at', searchState.sortDirection ?? 'desc');
  }
}

export function search(
  entries: Array<ActiveJournalEntry>,
  filter?: string | null,
): Array<ActiveJournalEntry> {
  if (filter) {
    const filterQuery = buildFuseQuery(filter, FUSE_OPTIONS.keys);
    const fuse = new Fuse(entries, FUSE_OPTIONS);
    return fuse.search(filterQuery).map((result) => result.item);
  } else {
    return entries;
  }
}

export function sort(
  entries: Array<ActiveJournalEntry>,
  sort: JournalSort = 'updated_at',
  sortDirection: JournalSortDirection = 'desc',
): Array<ActiveJournalEntry> {
  const reverse = (entries: Array<ActiveJournalEntry>) =>
    sortDirection === 'asc' ? entries : entries.reverse();
  return reverse(
    entries.sort((e1: ActiveJournalEntry, e2: ActiveJournalEntry) => {
      switch (sort) {
        case 'method_coffee_type':
          return `${e1.method}-${getCoffeeLabel(e1.coffeeType) ?? ''}`.localeCompare(
            `${e2.method}-${getCoffeeLabel(e2.coffeeType) ?? ''}`,
          );
        case 'rating':
          if (e1.rating === undefined && e2.rating === undefined) {
            return 0;
          } else if (e1.rating === undefined) {
            return -1;
          } else if (e2.rating === undefined) {
            return 1;
          } else {
            return e1.rating - e2.rating;
          }
        case 'updated_at':
          return e1.updatedAt.localeCompare(e2.updatedAt);
      }
    }),
  );
}
