import type { ActiveJournalEntry, JournalSearchState, JournalSort } from '$lib/models/journal';
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
} satisfies Fuse.IFuseOptions<ActiveJournalEntry>;

export function sortOrSearch(
  entries: Array<ActiveJournalEntry>,
  searchState: JournalSearchState,
): Array<ActiveJournalEntry> {
  if (searchState.filter) {
    return search(entries, searchState.filter);
  } else {
    return sort(entries, searchState.sort ?? 'asc');
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
  sort: JournalSort = 'asc',
): Array<ActiveJournalEntry> {
  const reverse = (entries: Array<ActiveJournalEntry>) =>
    sort === 'asc' ? entries : entries.reverse();
  return reverse(
    entries.sort((e1: ActiveJournalEntry, e2: ActiveJournalEntry) =>
      `${e1.method}-${e1.coffeeType ?? ''}`.localeCompare(`${e2.method}-${e2.coffeeType ?? ''}`),
    ),
  );
}
