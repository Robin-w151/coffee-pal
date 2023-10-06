import type { CachedSearchResult } from '$lib/models/cachedSearch';
import type { ActiveJournalEntry, JournalSearchState, JournalWorker } from '$lib/models/journal';
import { expose } from 'comlink';
import { sortOrSearch as sortOrSearchImpl } from './search';
import { JOURNAL_BATCH_SIZE } from '$lib/config/journal';

let data: Array<ActiveJournalEntry> = [];

function sortOrSearch(
  entries: Array<ActiveJournalEntry>,
  search: JournalSearchState,
): CachedSearchResult<ActiveJournalEntry> {
  data = sortOrSearchImpl(entries, search);

  return {
    data: data.slice(0, JOURNAL_BATCH_SIZE),
    totalEntries: data.length,
  };
}

function loadMore(index: number, count: number): Array<ActiveJournalEntry> {
  return data.slice(index, index + count);
}

expose({
  sortOrSearch,
  loadMore,
} satisfies JournalWorker);
