import type { MeasurementSystem, Unit } from '$lib/models/measurement';

export function getPreferredUnit(units: Array<Unit>, system: MeasurementSystem): Unit | undefined {
  return units.find((unit) => unit.system === system);
}
