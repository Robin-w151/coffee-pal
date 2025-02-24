import { round } from '$lib/shared/math';

export function calculateDripRate(timestamps: Array<number>): number {
  if (timestamps.length < 2) {
    return 0;
  }

  const differences: number[] = [];
  const weights: number[] = [];

  for (let i = 0; i < timestamps.length - 1; i++) {
    differences.push(timestamps[i + 1] - timestamps[i]);
    weights.push(Math.exp(i / Math.max(timestamps.length - 2, 0.001)));
  }

  const weightedSum = differences.reduce((sum, diff, i) => sum + diff * weights[i], 0);
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const weightedMeanDifference = weightedSum / weightSum;

  return round(60_000 / weightedMeanDifference, 0)!;
}
