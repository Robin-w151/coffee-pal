import type { ActiveJournalEntry } from '$lib/models/journal';
import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';
import { isEqual } from 'lodash-es';

export function isLooslyEqual<V>(value: V, other: V): boolean {
  if (!value && !other) {
    return true;
  }

  return value === other;
}

export function isEqualJournalEntry(
  entry?: Partial<ActiveJournalEntry>,
  other?: Partial<ActiveJournalEntry>,
): boolean {
  return (
    isLooslyEqual(entry?.method, other?.method) &&
    isLooslyEqual(entry?.water, other?.water) &&
    isLooslyEqual(entry?.waterTemperature, other?.waterTemperature) &&
    isLooslyEqual(entry?.coffee, other?.coffee) &&
    isEqualCoffeeEntry(entry?.coffeeType, other?.coffeeType) &&
    isLooslyEqual(entry?.grindSettings, other?.grindSettings) &&
    isLooslyEqual(entry?.rating, other?.rating) &&
    isLooslyEqual(entry?.description, other?.description) &&
    isLooslyEqual(entry?.createdAt, other?.createdAt) &&
    isLooslyEqual(entry?.updatedAt, other?.updatedAt)
  );
}

export function isEqualCoffeeEntry(
  entry?: string | Partial<ActiveCoffeeEntry>,
  other?: string | Partial<ActiveCoffeeEntry>,
): boolean {
  if (typeof entry === 'string' || typeof other === 'string') {
    return isLooslyEqual(entry, other);
  }

  return (
    isLooslyEqual(entry?.name, other?.name) &&
    isLooslyEqual(entry?.origin, other?.origin) &&
    isLooslyEqual(entry?.variety, other?.variety) &&
    isLooslyEqual(entry?.process, other?.process) &&
    isLooslyEqual(entry?.altitude, other?.altitude) &&
    isLooslyEqual(entry?.roaster, other?.roaster) &&
    isLooslyEqual(entry?.trader, other?.trader) &&
    isEqual(entry?.aromas, other?.aromas) &&
    isLooslyEqual(entry?.rating, other?.rating) &&
    isLooslyEqual(entry?.description, other?.description) &&
    isLooslyEqual(entry?.createdAt, other?.createdAt) &&
    isLooslyEqual(entry?.updatedAt, other?.updatedAt)
  );
}
