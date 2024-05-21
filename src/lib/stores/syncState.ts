import type { SyncState } from '$lib/models/sync';
import { Subject } from 'rxjs';
import { writable, type Readable } from 'svelte/store';

export interface SyncStateStore extends Readable<SyncState> {
  setIsSynchronizing: (isSynchronizing: boolean) => void;
}

const initialState: SyncState = { isSynchronizing: false };
const { subscribe, update } = writable<SyncState>(initialState);
const events = new Subject<SyncState>();

function setIsSynchronizing(isSynchronizing: boolean): void {
  update((sync) => {
    const newState = { ...sync, isSynchronizing };
    events.next(newState);
    return newState;
  });
}

export const syncStateStore = {
  subscribe,
  setIsSynchronizing,
};

export const syncStateEvents = events.asObservable();
