import type { ActiveJournalEntry, JournalSort, JournalSortDirection } from '$lib/models/journal';
import { describe, expect, test } from 'vitest';
import { search, sort, sortOrSearch } from './search';

export const testJournalEntries: Array<ActiveJournalEntry> = [
  {
    id: '1c3897d0-0b79-480c-a953-9ce9224bb8f0',
    method: 'Aeropress',
    water: 200,
    waterTemperature: 100,
    coffee: 13,
    coffeeType: {
      id: '191ee4a7-a43d-4a43-98e3-9e5861106d86',
      name: 'Terroir PAN',
      origin: 'Panama',
      process: 'Washed',
      variety: undefined,
      roaster: 'Rösterei',
      trader: 'Blasercafe',
      rating: undefined,
      aromas: ['blueberry', 'caramel', 'floral', 'sweet', 'honey'],
      description: undefined,
      createdAt: '2023-08-26T21:26:11.665+02:00',
      updatedAt: '2023-09-28T15:09:57.359+02:00',
    },
    grindSettings: '24 clicks',
    rating: 3,
    description: '40% ice',
    createdAt: '2023-08-26T21:44:48.371+02:00',
    updatedAt: '2023-12-26T21:44:48.371+02:00',
  },
  {
    id: '1860f178-ded7-48fe-89f5-d464be0c698f',
    method: 'PuckPuck',
    water: 500,
    coffee: 38,
    coffeeType: 'Äthiopien Chelbesa',
    grindSettings: '36 clicks',
    description: '20% ice, ~45-60 drops/min, 2.5h brew',
    createdAt: '2023-08-11T10:11:28.556+02:00',
    updatedAt: '2023-11-23T18:45:30.180+02:00',
  },
  {
    id: '20c94b21-0426-44ff-91a8-9e49ae54e04c',
    method: 'V60 Switch',
    water: 380,
    waterTemperature: 100,
    coffee: 25,
    coffeeType: 'Honeymoon',
    grindSettings: '24 clicks',
    rating: 5,
    description: undefined,
    createdAt: '2023-10-01T19:32:09.015+02:00',
    updatedAt: '2023-10-01T19:32:09.015+02:00',
  },
];

describe('sortOrSearch', () => {
  test.each([
    {
      filter: undefined,
      expectedMethod: 'Aeropress',
    },
    {
      filter: 'honeymoon',
      expectedMethod: 'V60 Switch',
    },
  ])('$filter finds $expectedMethod', ({ filter, expectedMethod }) => {
    const result = sortOrSearch(testJournalEntries, {
      filter,
    });
    expect(result[0].method).toBe(expectedMethod);
  });
});

describe('search', () => {
  test.each([
    {
      filter: '',
      expectedMethod: 'Aeropress',
    },
    {
      filter: 'switch',
      expectedMethod: 'V60 Switch',
    },
    {
      filter: 'panama',
      expectedMethod: 'Aeropress',
    },
    {
      filter: 'caramel',
      expectedMethod: 'Aeropress',
    },
    {
      filter: 'honeim',
      expectedMethod: 'V60 Switch',
    },
    {
      filter: 'chebes',
      expectedMethod: 'PuckPuck',
    },
    {
      filter: '45-60',
      expectedMethod: 'PuckPuck',
    },
    {
      filter: 'pckpack',
      expectedMethod: 'PuckPuck',
    },
  ])('search $filter finds $expectedMethod', ({ filter, expectedMethod }) => {
    const result = search(testJournalEntries, filter);
    expect(result[0].method).toBe(expectedMethod);
  });
});

describe('sort', () => {
  test.each([
    {
      sortType: 'method_coffee_type',
      sortDirection: 'asc',
      expectedMethods: ['Aeropress', 'PuckPuck', 'V60 Switch'],
    },
    {
      sortType: 'method_coffee_type',
      sortDirection: 'desc',
      expectedMethods: ['V60 Switch', 'PuckPuck', 'Aeropress'],
    },
    {
      sortType: 'rating',
      sortDirection: 'asc',
      expectedMethods: ['PuckPuck', 'Aeropress', 'V60 Switch'],
    },
    {
      sortType: 'rating',
      sortDirection: 'desc',
      expectedMethods: ['V60 Switch', 'Aeropress', 'PuckPuck'],
    },
    {
      sortType: 'updated_at',
      sortDirection: 'asc',
      expectedMethods: ['V60 Switch', 'PuckPuck', 'Aeropress'],
    },
    {
      sortType: 'updated_at',
      sortDirection: 'desc',
      expectedMethods: ['Aeropress', 'PuckPuck', 'V60 Switch'],
    },
  ])(
    'sort $sortType/$sortDirection finds $expectedMethods',
    ({ sortType, sortDirection, expectedMethods }) => {
      const result = sort(
        testJournalEntries,
        sortType as JournalSort,
        sortDirection as JournalSortDirection,
      ).map(({ method }) => method);
      expect(result).toEqual(expectedMethods);
    },
  );
});
