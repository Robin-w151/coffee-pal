import { round } from '$lib/shared/math';

export function calculateDripRate(timestamps: Array<number>): number {
  if (timestamps.length < 2) {
    return 0;
  }

  const differences = [];
  for (let i = 0; i < timestamps.length - 1; i++) {
    differences.push(timestamps[i + 1] - timestamps[i]);
  }

  const meanDifference = differences.reduce((d1, d2) => d1 + d2, 0) / differences.length;
  return round(60_000 / meanDifference, 0)!;
}
