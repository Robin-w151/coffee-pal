import type { SyncState } from '$lib/models/sync';
import { Subject } from 'rxjs';

export interface SyncStateStore extends SyncState {
  setIsSynchronizing: (isSynchronizing: boolean) => void;
}

const events = new Subject<SyncState>();

export const syncStateStore = createSyncStateStore();

export const syncStateEvents = events.asObservable();

function createSyncStateStore(): SyncStateStore {
  let isSynchronizing = $state(false);

  function setIsSynchronizing(newIsSynchronizing: boolean): void {
    isSynchronizing = newIsSynchronizing;
    events.next({ isSynchronizing });
  }

  return {
    get isSynchronizing() {
      return isSynchronizing;
    },
    setIsSynchronizing,
  };
}
