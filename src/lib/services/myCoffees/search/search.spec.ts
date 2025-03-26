import { describe, expect, test } from 'vitest';
import { search, sort, sortOrSearch } from './search';
import type {
  ActiveCoffeeEntry,
  MyCoffeesSort,
  MyCoffeesSortDirection,
} from '$lib/models/myCoffees';

export const testCoffeeEntries: Array<ActiveCoffeeEntry> = [
  {
    id: '1bdfaa18-8722-439f-b26b-caa7f67fed00',
    name: 'Rwanda Kamajumba',
    origin: 'Kamajumba Estate',
    process: 'Washed',
    variety: 'Red Bourbon',
    altitude: undefined,
    roaster: 'Drip Roasters',
    trader: 'Drip Roasters',
    rating: undefined,
    aromas: ['lemon', 'orange', 'black tea'],
    description: undefined,
    createdAt: '2023-08-26T21:29:31.780+02:00',
    updatedAt: '2023-10-26T21:29:31.780+02:00',
  },
  {
    id: '191ee4a7-a43d-4a43-98e3-9e5861106d86',
    name: 'Terroir PAN',
    origin: 'Panama',
    process: 'Washed',
    variety: undefined,
    altitude: 1500,
    roaster: 'Rösterei',
    trader: 'Blasercafe',
    rating: 4,
    aromas: ['blueberry', 'caramel', 'floral', 'sweet', 'honey'],
    description: undefined,
    createdAt: '2023-08-26T21:26:11.665+02:00',
    updatedAt: '2023-09-28T15:09:57.359+02:00',
  },
  {
    id: '0f3bb076-7346-44fb-8c1d-d74a8c691441',
    name: 'Wiedner Mischung',
    origin: 'Mix',
    process: 'Washed',
    variety: 'Arabica',
    altitude: 1000,
    roaster: 'Alt Wien',
    trader: 'Alt Wien',
    rating: 2,
    aromas: ['cocoa', 'caramel', 'walnut', 'black tea', 'nut meg', 'pepper', 'marzipan'],
    description: undefined,
    createdAt: '2023-09-14T16:19:42.679+02:00',
    updatedAt: '2023-09-14T18:30:27.456+02:00',
  },
];

describe('sortOrSearch', () => {
  test.each([
    {
      filter: undefined,
      expectedName: 'Rwanda Kamajumba',
    },
    {
      filter: 'blueberry',
      expectedName: 'Terroir PAN',
    },
  ])('$filter finds $expectedName', ({ filter, expectedName }) => {
    const result = sortOrSearch(testCoffeeEntries, { filter });
    expect(result[0].name).toBe(expectedName);
  });
});

describe('search', () => {
  test.each([
    {
      filter: '',
      expectedName: 'Rwanda Kamajumba',
    },
    {
      filter: 'drip',
      expectedName: 'Rwanda Kamajumba',
    },
    {
      filter: 'lemon',
      expectedName: 'Rwanda Kamajumba',
    },
    {
      filter: 'anam',
      expectedName: 'Terroir PAN',
    },
    {
      filter: 'terr caramel',
      expectedName: 'Terroir PAN',
    },
    {
      filter: 'röster',
      expectedName: 'Terroir PAN',
    },
    {
      filter: 'coca',
      expectedName: 'Wiedner Mischung',
    },
    {
      filter: 'wien',
      expectedName: 'Wiedner Mischung',
    },
    {
      filter: 'Wiend',
      expectedName: 'Wiedner Mischung',
    },
  ])('$filter finds $expectedName', ({ filter, expectedName }) => {
    const result = search(testCoffeeEntries, filter);
    expect(result[0].name).toBe(expectedName);
  });
});

describe('sort', () => {
  test.each([
    {
      sortType: 'name_origin',
      sortDirection: 'asc',
      expectedNames: ['Rwanda Kamajumba', 'Terroir PAN', 'Wiedner Mischung'],
    },
    {
      sortType: 'name_origin',
      sortDirection: 'desc',
      expectedNames: ['Wiedner Mischung', 'Terroir PAN', 'Rwanda Kamajumba'],
    },
    {
      sortType: 'altitude',
      sortDirection: 'asc',
      expectedNames: ['Wiedner Mischung', 'Terroir PAN', 'Rwanda Kamajumba'],
    },
    {
      sortType: 'altitude',
      sortDirection: 'desc',
      expectedNames: ['Terroir PAN', 'Wiedner Mischung', 'Rwanda Kamajumba'],
    },
    {
      sortType: 'rating',
      sortDirection: 'asc',
      expectedNames: ['Rwanda Kamajumba', 'Wiedner Mischung', 'Terroir PAN'],
    },
    {
      sortType: 'rating',
      sortDirection: 'desc',
      expectedNames: ['Terroir PAN', 'Wiedner Mischung', 'Rwanda Kamajumba'],
    },
    {
      sortType: 'created_at',
      sortDirection: 'asc',
      expectedNames: ['Terroir PAN', 'Rwanda Kamajumba', 'Wiedner Mischung'],
    },
    {
      sortType: 'created_at',
      sortDirection: 'desc',
      expectedNames: ['Wiedner Mischung', 'Rwanda Kamajumba', 'Terroir PAN'],
    },
    {
      sortType: 'updated_at',
      sortDirection: 'asc',
      expectedNames: ['Wiedner Mischung', 'Terroir PAN', 'Rwanda Kamajumba'],
    },
    {
      sortType: 'updated_at',
      sortDirection: 'desc',
      expectedNames: ['Rwanda Kamajumba', 'Terroir PAN', 'Wiedner Mischung'],
    },
  ])(
    '$sortType/$sortDirection finds $expectedNames',
    ({ sortType, sortDirection, expectedNames }) => {
      const result = sort(
        testCoffeeEntries,
        sortType as MyCoffeesSort,
        sortDirection as MyCoffeesSortDirection,
      ).map(({ name }) => name);
      expect(result).toEqual(expectedNames);
    },
  );
});
