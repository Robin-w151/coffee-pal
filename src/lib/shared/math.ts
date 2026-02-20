export function calculateRatio(
  coffee: number | undefined,
  water: number | undefined,
): string | undefined {
  if (!coffee || coffee <= 0 || !water || water <= 0) {
    return;
  }

  return `1:${round(water / coffee, 1)}`;
}

export function sanitize(value: number | null | undefined): number {
  if (!value || value < 0) {
    return 0;
  }

  return round(value)!;
}

export function round(value: number | undefined, precision = 2): number | undefined {
  if (value === undefined || value === null) {
    return;
  }

  return Number.parseFloat((+value).toFixed(precision));
}
