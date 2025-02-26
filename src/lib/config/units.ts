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

export const UNIT_TABLESPOON_GROUND_COFFEE = {
  label: 'tbsp',
  conversion: {
    fromBase: (value) => {
      if (value == null) {
        return;
      }
      return value / 5;
    },
    toBase: (value) => {
      if (value == null) {
        return;
      }
      return value * 5;
    },
  },
  system: 'other',
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

export const UNIT_METER = {
  label: 'm',
  conversion: {
    fromBase: (value) => value,
    toBase: (value) => value,
  },
  system: 'metric',
} satisfies Unit;

export const UNIT_FEET = {
  label: 'ft',
  conversion: {
    fromBase: (value) => {
      if (value == null) {
        return;
      }
      return value * 3.28084;
    },
    toBase: (value) => {
      if (value == null) {
        return;
      }
      return value / 3.28084;
    },
  },
  system: 'imperial',
} satisfies Unit;

export const WEIGHT_UNITS: Array<Unit> = [UNIT_GRAM, UNIT_OZ];

export const WEIGHT_UNITS_COFFEE: Array<Unit> = [...WEIGHT_UNITS, UNIT_TABLESPOON_GROUND_COFFEE];

export const TEMPERATURE_UNITS: Array<Unit> = [UNIT_CELSIUS, UNIT_FAHRENHEIT];

export const LENGTH_UNITS: Array<Unit> = [UNIT_METER, UNIT_FEET];

export const DEFAULT_WEIGHT_UNIT = UNIT_GRAM;

export const DEFAULT_TEMPERATURE_UNIT = UNIT_CELSIUS;

export const DEFAULT_LENGTH_UNIT = UNIT_METER;
