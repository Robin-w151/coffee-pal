import { browser } from '$app/environment';
import type { JournalEntry, JournalSort } from '$lib/models/journal';
import { sort as sortImpl } from './sort';
import { wrap } from 'comlink';

let workerInstance: any;

export async function sort(
  entries: Array<JournalEntry>,
  sort: JournalSort = 'asc',
): Promise<Array<JournalEntry>> {
  if (browser) {
    return sortWorker(entries, sort);
  } else {
    return sortImpl(entries, sort);
  }
}

async function sortWorker(
  entries: Array<JournalEntry>,
  sort: JournalSort = 'asc',
): Promise<Array<JournalEntry>> {
  if (!workerInstance) {
    const worker = await import('./worker?worker');
    workerInstance = wrap(new worker.default());
  }

  return workerInstance.sort(entries, sort);
}
