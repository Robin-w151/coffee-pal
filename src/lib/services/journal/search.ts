import type {
  ActiveJournalEntry,
  JournalSearchState,
  JournalSort,
  JournalSortDirection,
} from '$lib/models/journal';
import { buildFuseQuery } from '$lib/utils/search/fuzzy';
import Fuse, { type IFuseOptions } from 'fuse.js';

const FUSE_OPTIONS = {
  threshold: 0.4,
  ignoreLocation: true,
  findAllMatches: true,
  keys: [
    'method',
    'water',
    'waterTemperature',
    'coffee',
    'coffeeType',
    'grindSettings',
    'description',
  ],
} satisfies IFuseOptions<ActiveJournalEntry>;

export function sortOrSearch(
  entries: Array<ActiveJournalEntry>,
  searchState: JournalSearchState,
): Array<ActiveJournalEntry> {
  if (searchState.filter) {
    return search(entries, searchState.filter);
  } else {
    return sort(entries, searchState.sort ?? 'title', searchState.sortDirection ?? 'asc');
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
  sort: JournalSort = 'title',
  sortDirection: JournalSortDirection = 'asc',
): Array<ActiveJournalEntry> {
  const reverse = (entries: Array<ActiveJournalEntry>) =>
    sortDirection === 'asc' ? entries : entries.reverse();
  return reverse(
    entries.sort((e1: ActiveJournalEntry, e2: ActiveJournalEntry) => {
      switch (sort) {
        case 'title':
          return `${e1.method}-${e1.coffeeType ?? ''}`.localeCompare(
            `${e2.method}-${e2.coffeeType ?? ''}`,
          );
        case 'updated_at':
          return e1.updatedAt.localeCompare(e2.updatedAt);
      }
    }),
  );
}
