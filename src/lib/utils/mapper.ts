import type { Journal, JournalState } from '$lib/models/journal';
import type { MyCoffees, MyCoffeesState } from '$lib/models/myCoffees';

export function mapToJournal(journalState: JournalState): Journal {
  const clone = { ...journalState } as Partial<JournalState>;
  delete clone.activeEntries;
  delete clone.isLoading;
  return clone as Journal;
}

export function mapToMyCoffees(myCoffeesState: MyCoffeesState): MyCoffees {
  const clone = { ...myCoffeesState } as Partial<MyCoffeesState>;
  delete clone.activeEntries;
  delete clone.isLoading;
  return clone as MyCoffees;
}
