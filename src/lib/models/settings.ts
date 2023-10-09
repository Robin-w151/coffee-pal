import type { MeasurementSystem } from './measurement';

export interface Settings {
  colorScheme: ColorScheme;
  preferredUnits: MeasurementSystem;
}

export type ColorScheme = 'system' | 'light' | 'dark';

export function isColorScheme(colorScheme?: string | null): colorScheme is ColorScheme {
  if (!colorScheme) {
    return false;
  }

  return ['system', 'light', 'dark'].includes(colorScheme);
}

export function isMeasurementSystem(
  preferredUnits?: MeasurementSystem | null,
): preferredUnits is MeasurementSystem {
  if (!preferredUnits) {
    return false;
  }

  return ['metric', 'imperial'].includes(preferredUnits);
}
