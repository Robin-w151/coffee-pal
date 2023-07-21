export function gcd(a: number, b: number): number {
  if (!b) {
    return a;
  }

  return gcd(b, a % b);
}

export function sanitize(value?: number | null): number {
  if (!value || value < 0) {
    return 0;
  }

  return parseFloat(value.toFixed(2));
}
