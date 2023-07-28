export function gcd(a: number, b: number): number {
  if (!b) {
    return a;
  }

  return gcd(b, a % b);
}

export function calculateRatio(coffee?: number, water?: number): string | undefined {
  if (!coffee || coffee <= 0 || !water || water <= 0) {
    return;
  }

  return `1:${round(water / coffee, 1)}`;
}

export function sanitize(value?: number | null): number {
  if (!value || value < 0) {
    return 0;
  }

  return round(value);
}

export function round(value: number, precision = 2): number {
  return parseFloat(value.toFixed(precision));
}
