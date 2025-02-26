import { describe, it, expect } from 'vitest';
import { getAromaColor } from './colors';
import type { ColorPair } from '$lib/models/color';

describe('getAromaColor', () => {
  it('should return the correct color pair for exact aroma matches', () => {
    expect(getAromaColor('burnt')).toEqual({
      color: 'black',
      backgroundColor: 'rgb(190, 134, 99)',
    });

    expect(getAromaColor('chocolate')).toEqual({
      color: 'white',
      backgroundColor: 'rgb(105, 42, 25)',
    });

    expect(getAromaColor('lemon')).toEqual({
      color: 'black',
      backgroundColor: 'rgb(253, 228, 2)',
    });
  });

  it('should handle multi-word aromas correctly', () => {
    expect(getAromaColor('dark chocolate')).toEqual({
      color: 'white',
      backgroundColor: 'rgb(71, 6, 3)',
    });

    expect(getAromaColor('brown sugar')).toEqual({
      color: 'black',
      backgroundColor: 'rgb(212, 90, 89)',
    });

    expect(getAromaColor('maple syrup')).toEqual({
      color: 'white',
      backgroundColor: 'rgb(174, 52, 31)',
    });
  });

  it('should handle fuzzy matching for similar aromas', () => {
    expect(getAromaColor('chocolatey')).toEqual({
      color: 'white',
      backgroundColor: 'rgb(105, 42, 25)',
    });

    expect(getAromaColor('nutty flavor')).toEqual({
      color: 'black',
      backgroundColor: 'rgb(199, 136, 105)',
    });
  });

  it('should handle multiple words and find the best match', () => {
    expect(getAromaColor('chocolate and berry')).toEqual({
      color: 'black',
      backgroundColor: 'rgb(221, 76, 81)',
    });

    expect(getAromaColor('floral with hints of citrus')).toEqual({
      color: 'black',
      backgroundColor: 'rgb(224, 113, 156)',
    });
  });

  it('should return default color pair for unmatched aromas', () => {
    const defaultColorPair: ColorPair = {
      color: 'black',
      backgroundColor: 'rgb(215, 136, 35)',
    };

    expect(getAromaColor('nonexistent')).toEqual(defaultColorPair);
    expect(getAromaColor('xyz123')).toEqual(defaultColorPair);
    expect(getAromaColor('')).toEqual(defaultColorPair);
  });

  it('should handle case insensitivity', () => {
    expect(getAromaColor('CHOCOLATE')).toEqual({
      color: 'white',
      backgroundColor: 'rgb(105, 42, 25)',
    });

    expect(getAromaColor('Vanilla')).toEqual({
      color: 'black',
      backgroundColor: 'rgb(248, 154, 128)',
    });
  });

  it('should handle whitespace correctly', () => {
    expect(getAromaColor('  chocolate  ')).toEqual({
      color: 'white',
      backgroundColor: 'rgb(105, 42, 25)',
    });

    expect(getAromaColor('berry   notes')).toEqual({
      color: 'black',
      backgroundColor: 'rgb(221, 76, 81)',
    });
  });

  it('should match specific fruit variants correctly', () => {
    expect(getAromaColor('strawberry')).toEqual({
      color: 'black',
      backgroundColor: 'rgb(239, 45, 54)',
    });

    expect(getAromaColor('blueberry')).toEqual({
      color: 'white',
      backgroundColor: 'rgb(100, 105, 176)',
    });
  });

  it('should have acceptable performance', () => {
    const testAromas = [
      'chocolate',
      'vanilla',
      'berry',
      'nonexistent',
      'floral notes',
      'dark chocolate with berry',
      'sweet caramel',
      'roasted nuts and citrus',
    ];

    const iterations = 1000;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      const aroma = testAromas[Math.floor(Math.random() * testAromas.length)];
      getAromaColor(aroma);
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTimePerSearch = totalTime / iterations;

    expect(avgTimePerSearch).toBeLessThan(10);
  });
});
