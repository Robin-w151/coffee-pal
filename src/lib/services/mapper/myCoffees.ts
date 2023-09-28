import type { MyCoffeesState, MyCoffees } from '$lib/models/myCoffees';

export function mapToMyCoffees(myCoffeesState: MyCoffeesState): MyCoffees {
  const clone = { ...myCoffeesState } as Partial<MyCoffeesState>;
  delete clone.activeEntries;
  delete clone.isLoading;
  return clone as MyCoffees;
}
