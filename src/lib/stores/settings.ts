import type { MeasurementSystem } from '$lib/models/measurement';
import type { Settings } from '$lib/models/settings';
import { localStorageStore } from '@skeletonlabs/skeleton';
import type { Readable } from 'svelte/store';

export interface SettingsStore extends Readable<Settings> {
  setPreferredUnits: (preferredUnits: MeasurementSystem) => void;
}

const SETTINGS_STORE_NAME = 'settings';

export const settingsStore = createSettingsStore();

function createSettingsStore(): SettingsStore {
  const initialState = { preferredUnits: 'metric' } satisfies Settings;
  const { subscribe, update } = localStorageStore<Settings>(SETTINGS_STORE_NAME, initialState);

  function setPreferredUnits(preferredUnits: MeasurementSystem): void {
    update((settings) => ({ ...settings, preferredUnits }));
  }

  return {
    subscribe,
    setPreferredUnits,
  };
}
