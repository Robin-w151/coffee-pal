import {
  DEFAULT_TEMPERATURE_UNIT,
  DEFAULT_WEIGHT_UNIT,
  TEMPERATURE_UNITS,
  WEIGHT_UNITS,
} from '$lib/config/units';
import type { MeasurementSystem, Unit } from '$lib/models/measurement';
import { round } from './math';

export function getPreferredUnit(units: Array<Unit>, system: MeasurementSystem): Unit | undefined {
  return units.find((unit) => unit.system === system);
}

export function getPreferredWeightUnit(system: MeasurementSystem): Unit {
  return getPreferredUnit(WEIGHT_UNITS, system) ?? DEFAULT_WEIGHT_UNIT;
}

export function getPreferredTemperatureUnit(system: MeasurementSystem): Unit {
  return getPreferredUnit(TEMPERATURE_UNITS, system) ?? DEFAULT_TEMPERATURE_UNIT;
}

export function getDisplayValue(value: number, unit: Unit, addSpace = false): string {
  return `${round(unit.conversion.fromBase(value))}${addSpace ? ' ' : ''}${unit.label}`;
}
