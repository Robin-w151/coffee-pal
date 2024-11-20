import { describe, expect, test } from 'vitest';
import { calculateRatio, round, sanitize } from './math';

describe('calculateRatio', () => {
  test.each([
    {
      coffee: undefined,
      water: 200,
      expected: undefined,
    },
    {
      coffee: 12,
      water: undefined,
      expected: undefined,
    },
    {
      coffee: 0,
      water: 200,
      expected: undefined,
    },
    {
      coffee: 12,
      water: 0,
      expected: undefined,
    },
    {
      coffee: 12,
      water: 200,
      expected: '1:16.7',
    },
  ])('$coffee/$water == $expected', ({ coffee, water, expected }) => {
    expect(calculateRatio(coffee, water)).toBe(expected);
  });
});

describe('sanitize', () => {
  test.each([
    {
      value: undefined,
      expected: 0,
    },
    {
      value: -2.98,
      expected: 0,
    },
    {
      value: 16.66667,
      expected: 16.67,
    },
  ])('$value -> $expected', ({ value, expected }) => {
    expect(sanitize(value)).toBe(expected);
  });
});

describe('round', () => {
  test.each([
    {
      value: undefined,
      precision: undefined,
      expected: undefined,
    },
    {
      value: 13.33333,
      precision: undefined,
      expected: 13.33,
    },
    {
      value: 13.33333,
      precision: 1,
      expected: 13.3,
    },
  ])('$value to precision $precision -> $expected', ({ value, precision, expected }) => {
    expect(round(value, precision)).toBe(expected);
  });
});
