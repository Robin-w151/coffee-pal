import {
  isDeletedJournalEntry,
  type JournalEntry,
  type JournalSearchState,
  type JournalSort,
} from '$lib/models/journal';
import { buildFuseQuery } from '$lib/utils/search/fuzzy';
import Fuse from 'fuse.js';

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
} satisfies Fuse.IFuseOptions<JournalEntry>;

export function sortOrSearch(
  entries: Array<JournalEntry>,
  searchState: JournalSearchState,
): Array<JournalEntry> {
  if (searchState.filter) {
    return search(entries, searchState.filter);
  } else {
    return sort(entries, searchState.sort ?? 'asc');
  }
}

export function search(entries: Array<JournalEntry>, filter?: string | null): Array<JournalEntry> {
  if (filter) {
    const filterQuery = buildFuseQuery(filter, FUSE_OPTIONS.keys);
    const fuse = new Fuse(entries, FUSE_OPTIONS);
    return fuse.search(filterQuery).map((result) => result.item);
  } else {
    return entries;
  }
}

export function sort(entries: Array<JournalEntry>, sort: JournalSort = 'asc'): Array<JournalEntry> {
  const reverse = (entries: Array<JournalEntry>) => (sort === 'asc' ? entries : entries.reverse());
  return reverse(
    entries.sort((e1: JournalEntry, e2: JournalEntry) => {
      if (isDeletedJournalEntry(e1) && isDeletedJournalEntry(e2)) {
        return 0;
      } else if (isDeletedJournalEntry(e1)) {
        return 1;
      } else if (isDeletedJournalEntry(e2)) {
        return -1;
      } else {
        return `${e1.method}-${e1.coffeeType ?? ''}`.localeCompare(
          `${e2.method}-${e2.coffeeType ?? ''}`,
        );
      }
    }),
  );
}
