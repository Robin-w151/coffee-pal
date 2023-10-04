import { type JournalEntry, type JournalSort, isDeletedJournalEntry } from '$lib/models/journal';

export function sort(entries: Array<JournalEntry>, sort: JournalSort = 'asc'): Array<JournalEntry> {
  const reverse = (entries: Array<JournalEntry>) =>
    sort === 'asc' ? entries : entries.toReversed();
  return reverse(
    entries.toSorted((e1, e2) => {
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
