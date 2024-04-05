import { browser } from '$app/environment';
import type { CachedSearchResult } from '$lib/models/cachedSearch';
import type { ActiveJournalEntry, JournalSearchState } from '$lib/models/journal';
import { wrap } from 'comlink';

const worker: any = browser
  ? import('./worker?worker').then((w) => wrap(new w.default()))
  : undefined;

export async function sortOrSearch(
  entries: Array<ActiveJournalEntry>,
  search: JournalSearchState,
): Promise<CachedSearchResult<ActiveJournalEntry>> {
  if (browser) {
    return (await worker).sortOrSearch(entries, search);
  } else {
    return { data: [], totalEntries: 0 };
  }
}

export async function loadPage(index: number, count: number): Promise<Array<ActiveJournalEntry>> {
  if (browser) {
    return (await worker).loadPage(index, count);
  } else {
    return [];
  }
}
