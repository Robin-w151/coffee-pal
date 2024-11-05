import { describe, expect, test } from 'vitest';
import { calculateDripRate } from './dripRate';

describe('calculateDripRate', () => {
  test.each([
    [[], 0],
    [[1000], 0],
    [[0, 1000, 2000, 3000], 60],
    [[0, 500, 1500], 80],
    [[1000, 3000, 5000, 7000], 30],
  ])(`rate of %o == %i`, (instants, expected) => {
    expect(calculateDripRate(instants)).toBe(expected);
  });
});
