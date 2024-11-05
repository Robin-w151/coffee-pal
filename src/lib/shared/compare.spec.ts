import { describe, expect, test } from 'vitest';
import { isEqualCoffeeEntry, isEqualJournalEntry, isLooslyEqual } from './compare';

describe('isLooslyEqual', () => {
  test('undefined == undefined', () => {
    expect(isLooslyEqual(undefined, undefined)).toBe(true);
  });

  test('undefined == null', () => {
    expect(isLooslyEqual(undefined, null)).toBe(true);
  });

  test('undefined != 1', () => {
    expect(isLooslyEqual(undefined, 1)).toBe(false);
  });

  test('"string" != null', () => {
    expect(isLooslyEqual('string', undefined)).toBe(false);
  });

  test('1 == 1', () => {
    expect(isLooslyEqual(1, 1)).toBe(true);
  });

  test('1 != 2', () => {
    expect(isLooslyEqual(1, 2)).toBe(false);
  });

  test('"string" == "string"', () => {
    expect(isLooslyEqual('string', 'string')).toBe(true);
  });

  test('"string" != "other"', () => {
    expect(isLooslyEqual('string', 'other')).toBe(false);
  });
});

describe('isEqualJournalEntry', () => {
  test('method "method" == "method"', () => {
    expect(isEqualJournalEntry({ method: 'method' }, { method: 'method' })).toBe(true);
  });

  test('method "method" != "other"', () => {
    expect(isEqualJournalEntry({ method: 'method' }, { method: 'other' })).toBe(false);
  });

  test('method undefined != "method"', () => {
    expect(isEqualJournalEntry({ method: undefined }, { method: 'method' })).toBe(false);
  });

  test('method undefined == undefined', () => {
    expect(isEqualJournalEntry({ method: undefined }, { method: undefined })).toBe(true);
  });

  test('water 200 == 200', () => {
    expect(isEqualJournalEntry({ water: 200 }, { water: 200 })).toBe(true);
  });

  test('water 200 == 333', () => {
    expect(isEqualJournalEntry({ water: 200 }, { water: 333 })).toBe(false);
  });

  test('water undefined == 200', () => {
    expect(isEqualJournalEntry({ water: undefined }, { water: 200 })).toBe(false);
  });

  test('water undefined == undefined', () => {
    expect(isEqualJournalEntry({ water: undefined }, { water: undefined })).toBe(true);
  });

  test('waterTemperature 200 == 200', () => {
    expect(isEqualJournalEntry({ waterTemperature: 200 }, { waterTemperature: 200 })).toBe(true);
  });

  test('waterTemperature 200 == 333', () => {
    expect(isEqualJournalEntry({ waterTemperature: 200 }, { waterTemperature: 333 })).toBe(false);
  });

  test('waterTemperature undefined == 200', () => {
    expect(isEqualJournalEntry({ waterTemperature: undefined }, { waterTemperature: 200 })).toBe(
      false,
    );
  });

  test('waterTemperature undefined == undefined', () => {
    expect(
      isEqualJournalEntry({ waterTemperature: undefined }, { waterTemperature: undefined }),
    ).toBe(true);
  });

  test('coffee 200 == 200', () => {
    expect(isEqualJournalEntry({ coffee: 200 }, { coffee: 200 })).toBe(true);
  });

  test('coffee 200 == 333', () => {
    expect(isEqualJournalEntry({ coffee: 200 }, { coffee: 333 })).toBe(false);
  });

  test('coffee undefined == 200', () => {
    expect(isEqualJournalEntry({ coffee: undefined }, { coffee: 200 })).toBe(false);
  });

  test('coffee undefined == undefined', () => {
    expect(isEqualJournalEntry({ coffee: undefined }, { coffee: undefined })).toBe(true);
  });

  test('coffeeType "coffeeType" == "coffeeType"', () => {
    expect(isEqualJournalEntry({ coffeeType: 'coffeeType' }, { coffeeType: 'coffeeType' })).toBe(
      true,
    );
  });

  test('coffeeType {} == {}', () => {
    expect(
      isEqualJournalEntry(
        {
          coffeeType: {
            id: 'id',
            name: 'name',
            aromas: [],
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
          },
        },
        {
          coffeeType: {
            id: 'id',
            name: 'name',
            aromas: [],
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
          },
        },
      ),
    ).toBe(true);
  });

  test('coffeeType "coffeeType" != "other"', () => {
    expect(isEqualJournalEntry({ coffeeType: 'coffeeType' }, { coffeeType: 'other' })).toBe(false);
  });

  test('coffeeType {} == "other"', () => {
    expect(
      isEqualJournalEntry(
        {
          coffeeType: {
            id: 'id',
            name: 'name',
            aromas: [],
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
          },
        },
        {
          coffeeType: 'other',
        },
      ),
    ).toBe(false);
  });

  test('coffeeType undefined != "coffeeType"', () => {
    expect(isEqualJournalEntry({ coffeeType: undefined }, { coffeeType: 'coffeeType' })).toBe(
      false,
    );
  });

  test('coffeeType undefined == undefined', () => {
    expect(isEqualJournalEntry({ coffeeType: undefined }, { coffeeType: undefined })).toBe(true);
  });

  test('grindSettings "24" == "24"', () => {
    expect(isEqualJournalEntry({ grindSettings: '24' }, { grindSettings: '24' })).toBe(true);
  });

  test('grindSettings "24" == "34"', () => {
    expect(isEqualJournalEntry({ grindSettings: '24' }, { grindSettings: '34' })).toBe(false);
  });

  test('grindSettings undefined == "24"', () => {
    expect(isEqualJournalEntry({ grindSettings: undefined }, { grindSettings: '24' })).toBe(false);
  });

  test('grindSettings undefined == undefined', () => {
    expect(isEqualJournalEntry({ grindSettings: undefined }, { grindSettings: undefined })).toBe(
      true,
    );
  });

  test('rating 4 == 4', () => {
    expect(isEqualJournalEntry({ rating: 4 }, { rating: 4 })).toBe(true);
  });

  test('rating 4 == 1', () => {
    expect(isEqualJournalEntry({ rating: 4 }, { rating: 1 })).toBe(false);
  });

  test('rating undefined == 3', () => {
    expect(isEqualJournalEntry({ rating: undefined }, { rating: 3 })).toBe(false);
  });

  test('rating undefined == undefined', () => {
    expect(isEqualJournalEntry({ rating: undefined }, { rating: undefined })).toBe(true);
  });

  test('description "description" == "description"', () => {
    expect(
      isEqualJournalEntry({ description: 'description' }, { description: 'description' }),
    ).toBe(true);
  });

  test('description "description" == "other"', () => {
    expect(isEqualJournalEntry({ description: 'description' }, { description: 'other' })).toBe(
      false,
    );
  });

  test('description undefined == "description"', () => {
    expect(isEqualJournalEntry({ description: undefined }, { description: 'description' })).toBe(
      false,
    );
  });

  test('description undefined == undefined', () => {
    expect(isEqualJournalEntry({ description: undefined }, { description: undefined })).toBe(true);
  });

  test('createdAt "createdAt" == "createdAt"', () => {
    expect(isEqualJournalEntry({ createdAt: 'createdAt' }, { createdAt: 'createdAt' })).toBe(true);
  });

  test('createdAt "createdAt" == "other"', () => {
    expect(isEqualJournalEntry({ createdAt: 'createdAt' }, { createdAt: 'other' })).toBe(false);
  });

  test('createdAt undefined == "createdAt"', () => {
    expect(isEqualJournalEntry({ createdAt: undefined }, { createdAt: 'createdAt' })).toBe(false);
  });

  test('createdAt undefined == undefined', () => {
    expect(isEqualJournalEntry({ createdAt: undefined }, { createdAt: undefined })).toBe(true);
  });

  test('updatedAt "updatedAt" == "updatedAt"', () => {
    expect(isEqualJournalEntry({ updatedAt: 'updatedAt' }, { updatedAt: 'updatedAt' })).toBe(true);
  });

  test('updatedAt "updatedAt" == "other"', () => {
    expect(isEqualJournalEntry({ updatedAt: 'updatedAt' }, { updatedAt: 'other' })).toBe(false);
  });

  test('updatedAt undefined == "updatedAt"', () => {
    expect(isEqualJournalEntry({ updatedAt: undefined }, { updatedAt: 'updatedAt' })).toBe(false);
  });

  test('updatedAt undefined == undefined', () => {
    expect(isEqualJournalEntry({ updatedAt: undefined }, { updatedAt: undefined })).toBe(true);
  });
});

describe('isEqualCoffeeEntry', () => {
  test('name "name" == "name"', () => {
    expect(isEqualCoffeeEntry({ name: 'name' }, { name: 'name' })).toBe(true);
  });

  test('name "name" != "other"', () => {
    expect(isEqualCoffeeEntry({ name: 'name' }, { name: 'other' })).toBe(false);
  });

  test('name undefined != "name"', () => {
    expect(isEqualCoffeeEntry({ name: undefined }, { name: 'name' })).toBe(false);
  });

  test('name undefined == undefined', () => {
    expect(isEqualCoffeeEntry({ name: undefined }, { name: undefined })).toBe(true);
  });

  test('origin "origin" == "origin"', () => {
    expect(isEqualCoffeeEntry({ origin: 'origin' }, { origin: 'origin' })).toBe(true);
  });

  test('origin "origin" != "other"', () => {
    expect(isEqualCoffeeEntry({ origin: 'origin' }, { origin: 'other' })).toBe(false);
  });

  test('origin undefined != "origin"', () => {
    expect(isEqualCoffeeEntry({ origin: undefined }, { origin: 'origin' })).toBe(false);
  });

  test('origin undefined == undefined', () => {
    expect(isEqualCoffeeEntry({ origin: undefined }, { origin: undefined })).toBe(true);
  });

  test('variety "variety" == "variety"', () => {
    expect(isEqualCoffeeEntry({ variety: 'variety' }, { variety: 'variety' })).toBe(true);
  });

  test('variety "variety" != "other"', () => {
    expect(isEqualCoffeeEntry({ variety: 'variety' }, { variety: 'other' })).toBe(false);
  });

  test('variety undefined != "variety"', () => {
    expect(isEqualCoffeeEntry({ variety: undefined }, { variety: 'variety' })).toBe(false);
  });

  test('variety undefined == undefined', () => {
    expect(isEqualCoffeeEntry({ variety: undefined }, { variety: undefined })).toBe(true);
  });

  test('process "process" == "process"', () => {
    expect(isEqualCoffeeEntry({ process: 'process' }, { process: 'process' })).toBe(true);
  });

  test('process "process" != "other"', () => {
    expect(isEqualCoffeeEntry({ process: 'process' }, { process: 'other' })).toBe(false);
  });

  test('process undefined != "process"', () => {
    expect(isEqualCoffeeEntry({ process: undefined }, { process: 'process' })).toBe(false);
  });

  test('process undefined == undefined', () => {
    expect(isEqualCoffeeEntry({ process: undefined }, { process: undefined })).toBe(true);
  });

  test('roaster "roaster" == "roaster"', () => {
    expect(isEqualCoffeeEntry({ roaster: 'roaster' }, { roaster: 'roaster' })).toBe(true);
  });

  test('roaster "roaster" != "other"', () => {
    expect(isEqualCoffeeEntry({ roaster: 'roaster' }, { roaster: 'other' })).toBe(false);
  });

  test('roaster undefined != "roaster"', () => {
    expect(isEqualCoffeeEntry({ roaster: undefined }, { roaster: 'roaster' })).toBe(false);
  });

  test('roaster undefined == undefined', () => {
    expect(isEqualCoffeeEntry({ roaster: undefined }, { roaster: undefined })).toBe(true);
  });

  test('trader "trader" == "trader"', () => {
    expect(isEqualCoffeeEntry({ trader: 'trader' }, { trader: 'trader' })).toBe(true);
  });

  test('trader "trader" != "other"', () => {
    expect(isEqualCoffeeEntry({ trader: 'trader' }, { trader: 'other' })).toBe(false);
  });

  test('trader undefined != "trader"', () => {
    expect(isEqualCoffeeEntry({ trader: undefined }, { trader: 'trader' })).toBe(false);
  });

  test('trader undefined == undefined', () => {
    expect(isEqualCoffeeEntry({ trader: undefined }, { trader: undefined })).toBe(true);
  });

  test('aromas ["aroma1", "aroma2"] == ["aroma1", "aroma2"]', () => {
    expect(
      isEqualCoffeeEntry({ aromas: ['aroma1', 'aroma2'] }, { aromas: ['aroma1', 'aroma2'] }),
    ).toBe(true);
  });

  test('aromas ["aroma1", "aroma2"] != ["aroma1", "aroma2", "aroma3"]', () => {
    expect(
      isEqualCoffeeEntry(
        { aromas: ['aroma1', 'aroma2'] },
        { aromas: ['aroma1', 'aroma2', 'aroma3'] },
      ),
    ).toBe(false);
  });

  test('aromas ["aroma1", "aroma3"] == ["aroma1", "aroma2"]', () => {
    expect(
      isEqualCoffeeEntry({ aromas: ['aroma1', 'aroma3'] }, { aromas: ['aroma1', 'aroma2'] }),
    ).toBe(false);
  });

  test('aromas undefined != ["aroma1", "aroma2"]', () => {
    expect(isEqualCoffeeEntry({ aromas: undefined }, { aromas: ['aroma1', 'aroma2'] })).toBe(false);
  });

  test('aromas undefined == undefined', () => {
    expect(isEqualCoffeeEntry({ aromas: undefined }, { aromas: undefined })).toBe(true);
  });

  test('rating 4 == 4', () => {
    expect(isEqualCoffeeEntry({ rating: 4 }, { rating: 4 })).toBe(true);
  });

  test('rating 4 == 1', () => {
    expect(isEqualCoffeeEntry({ rating: 4 }, { rating: 1 })).toBe(false);
  });

  test('rating undefined == 3', () => {
    expect(isEqualCoffeeEntry({ rating: undefined }, { rating: 3 })).toBe(false);
  });

  test('rating undefined == undefined', () => {
    expect(isEqualCoffeeEntry({ rating: undefined }, { rating: undefined })).toBe(true);
  });

  test('description "description" == "description"', () => {
    expect(isEqualCoffeeEntry({ description: 'description' }, { description: 'description' })).toBe(
      true,
    );
  });

  test('description "description" == "other"', () => {
    expect(isEqualCoffeeEntry({ description: 'description' }, { description: 'other' })).toBe(
      false,
    );
  });

  test('description undefined == "description"', () => {
    expect(isEqualCoffeeEntry({ description: undefined }, { description: 'description' })).toBe(
      false,
    );
  });

  test('description undefined == undefined', () => {
    expect(isEqualCoffeeEntry({ description: undefined }, { description: undefined })).toBe(true);
  });

  test('createdAt "createdAt" == "createdAt"', () => {
    expect(isEqualCoffeeEntry({ createdAt: 'createdAt' }, { createdAt: 'createdAt' })).toBe(true);
  });

  test('createdAt "createdAt" == "other"', () => {
    expect(isEqualCoffeeEntry({ createdAt: 'createdAt' }, { createdAt: 'other' })).toBe(false);
  });

  test('createdAt undefined == "createdAt"', () => {
    expect(isEqualCoffeeEntry({ createdAt: undefined }, { createdAt: 'createdAt' })).toBe(false);
  });

  test('createdAt undefined == undefined', () => {
    expect(isEqualCoffeeEntry({ createdAt: undefined }, { createdAt: undefined })).toBe(true);
  });

  test('updatedAt "updatedAt" == "updatedAt"', () => {
    expect(isEqualCoffeeEntry({ updatedAt: 'updatedAt' }, { updatedAt: 'updatedAt' })).toBe(true);
  });

  test('updatedAt "updatedAt" == "other"', () => {
    expect(isEqualCoffeeEntry({ updatedAt: 'updatedAt' }, { updatedAt: 'other' })).toBe(false);
  });

  test('updatedAt undefined == "updatedAt"', () => {
    expect(isEqualCoffeeEntry({ updatedAt: undefined }, { updatedAt: 'updatedAt' })).toBe(false);
  });

  test('updatedAt undefined == undefined', () => {
    expect(isEqualCoffeeEntry({ updatedAt: undefined }, { updatedAt: undefined })).toBe(true);
  });
});
