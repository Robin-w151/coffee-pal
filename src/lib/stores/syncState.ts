import type { SyncState } from '$lib/models/sync';
import { writable, type Readable } from 'svelte/store';

export interface SyncStateStore extends Readable<SyncState> {
  setIsSynchronizing: (isSynchronizing: boolean) => void;
}

const initialState: SyncState = { isSynchronizing: false };
const { subscribe, update } = writable<SyncState>(initialState);

function setIsSynchronizing(isSynchronizing: boolean): void {
  update((sync) => ({ ...sync, isSynchronizing }));
}

export const syncStateStore = {
  subscribe,
  setIsSynchronizing,
};
