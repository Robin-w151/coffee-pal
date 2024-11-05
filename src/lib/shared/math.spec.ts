import { expect, test } from 'vitest';
import { calculateRatio, round, sanitize } from './math';

test('calculateRatio no coffee', () => {
  expect(calculateRatio(undefined, 200)).toBe(undefined);
});

test('calculateRatio no water', () => {
  expect(calculateRatio(12, undefined)).toBe(undefined);
});

test('calculateRatio coffee <= 0', () => {
  expect(calculateRatio(0, 200)).toBe(undefined);
});

test('calculateRatio water <= 0', () => {
  expect(calculateRatio(12, 0)).toBe(undefined);
});

test('calculateRatio 12/200', () => {
  expect(calculateRatio(12, 200)).toBe('1:16.7');
});

test('sanitize no value', () => {
  expect(sanitize(undefined)).toBe(0);
});

test('sanitize value <= 0', () => {
  expect(sanitize(-2.98)).toBe(0);
});

test('sanitize 16.66667', () => {
  expect(sanitize(16.66667)).toBe(16.67);
});

test('round no value', () => {
  expect(round(undefined)).toBe(undefined);
});

test('round 13.33333 to default precision', () => {
  expect(round(13.33333)).toBe(13.33);
});

test('round 13.33333 to 1 decimal place', () => {
  expect(round(13.33333, 1)).toBe(13.3);
});
