export interface MyCoffees {
  entries: Array<any>;
}

export type CoffeeEntry = ActiveCoffeeEntry | DeletedCoffeeEntry;

export interface ActiveCoffeeEntry {
  id: string;
  name: string;
  origin?: string;
  trader?: string;
  aromas: Array<string>;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeletedCoffeeEntry {
  id: string;
  deletedAt: string;
}

export interface MyCoffeesState extends MyCoffees {
  activeEntries: Array<ActiveCoffeeEntry>;
  isLoading: boolean;
}

export interface MyCoffeesSearchState {
  filter?: string | null;
  sort?: MyCoffeesSort | null;
}

export type MyCoffeesSort = 'asc' | 'desc';

export function isActiveCoffeeEntry(
  entry?: ActiveCoffeeEntry | DeletedCoffeeEntry | null,
): entry is ActiveCoffeeEntry {
  return (entry as ActiveCoffeeEntry)?.createdAt !== undefined;
}

export function isDeletedCoffeeEntry(
  entry?: ActiveCoffeeEntry | DeletedCoffeeEntry | null,
): entry is DeletedCoffeeEntry {
  return (entry as DeletedCoffeeEntry)?.deletedAt !== undefined;
}

export function containsString(entry: CoffeeEntry, filter?: string | null): boolean {
  if (!filter) {
    return true;
  }

  if (!isActiveCoffeeEntry(entry)) {
    return false;
  }

  const regexps = filter
    .split(' ')
    .filter((s) => !!s)
    .map((s) => new RegExp(s, 'i'));
  const { name, origin, trader, aromas, description } = entry;
  return [name, origin, trader, ...aromas, description]
    .filter((s) => !!s)
    .some((s) => regexps.some((r) => r.test(s as string)));
}
