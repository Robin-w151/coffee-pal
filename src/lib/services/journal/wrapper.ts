import { browser } from '$app/environment';
import type { JournalEntry, JournalSearchState } from '$lib/models/journal';
import { wrap } from 'comlink';
import { sortOrSearch as sortOrSearchImpl } from './search';

const worker: any = browser
  ? import('./worker?worker').then((w) => wrap(new w.default()))
  : undefined;

export async function sortOrSearch(
  entries: Array<JournalEntry>,
  search: JournalSearchState,
): Promise<Array<JournalEntry>> {
  if (browser) {
    return (await worker).sortOrSearch(entries, search);
  } else {
    return sortOrSearchImpl(entries, search);
  }
}
