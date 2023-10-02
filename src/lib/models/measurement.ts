export interface Measurement {
  value?: number;
  unit: Unit;
}

export interface Unit {
  label: string;
  conversion: Conversion;
  system: MeasurementSystem;
}

export type MeasurementSystem = 'metric' | 'imperial';

export interface Conversion {
  fromBase: (value?: number) => number | undefined;
  toBase: (value?: number) => number | undefined;
}
