import type { Entry } from './entry';

export interface Journal {
  entries: Array<Entry>;
  isLoading: boolean;
}
