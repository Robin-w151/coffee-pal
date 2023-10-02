import type { Unit } from '$lib/models/measurement';

export const UNIT_GRAM = {
  label: 'g',
  conversion: {
    fromBase: (value) => value,
    toBase: (value) => value,
  },
  system: 'metric',
} satisfies Unit;

export const UNIT_OZ = {
  label: 'oz',
  conversion: {
    fromBase: (value) => {
      if (value == null) {
        return;
      }
      return value / 28.349523125;
    },
    toBase: (value) => {
      if (value == null) {
        return;
      }
      return value * 28.349523125;
    },
  },
  system: 'imperial',
} satisfies Unit;

export const UNIT_CELSIUS = {
  label: '°C',
  conversion: {
    fromBase: (value) => value,
    toBase: (value) => value,
  },
  system: 'metric',
} satisfies Unit;

export const UNIT_FAHRENHEIT = {
  label: '°F',
  conversion: {
    fromBase: (value) => {
      if (value == null) {
        return;
      }
      return (9 / 5) * value + 32;
    },
    toBase: (value) => {
      if (value == null) {
        return;
      }
      return (value - 32) * (5 / 9);
    },
  },
  system: 'imperial',
} satisfies Unit;

export const WEIGHT_UNITS: Array<Unit> = [UNIT_GRAM, UNIT_OZ];

export const TEMPERATURE_UNITS: Array<Unit> = [UNIT_CELSIUS, UNIT_FAHRENHEIT];

export const DEFAULT_WEIGHT_UNIT = UNIT_GRAM;

export const DEFAULT_TEMPERATURE_UNIT = UNIT_CELSIUS;
