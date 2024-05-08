import { isEqualWith } from 'lodash-es';

export function isEqual<V, O>(value: V, other: O): boolean {
  return isEqualWith(value, other, (v, o) => {
    if (!v && !o) {
      return true;
    }
  });
}
