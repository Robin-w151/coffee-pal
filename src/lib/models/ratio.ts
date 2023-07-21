export interface Ratio {
  coffee: number;
  water: number;
}

export function equals(r1?: Ratio | null, r2?: Ratio | null): boolean {
  if (!r1 && !r2) {
    return true;
  }

  if (!r1 || !r2) {
    return false;
  }

  return r1.coffee === r2.coffee && r1.water === r2.water;
}
