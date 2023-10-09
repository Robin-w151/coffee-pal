import { browser } from '$app/environment';
import type { MeasurementSystem } from '$lib/models/measurement';
import {
  isColorScheme,
  type ColorScheme,
  type Settings,
  isMeasurementSystem,
} from '$lib/models/settings';
import { localStorageStore } from '@skeletonlabs/skeleton';
import type { Readable } from 'svelte/store';

export interface SettingsStore extends Readable<Settings> {
  setColorScheme: (colorScheme: ColorScheme) => void;
  setPreferredUnits: (preferredUnits: MeasurementSystem) => void;
}

const SETTINGS_STORE_NAME = 'settings';

export const settingsStore = createSettingsStore();

function createSettingsStore(): SettingsStore {
  const initialState = {
    colorScheme: 'system',
    preferredUnits: 'metric',
  } satisfies Settings;

  sanitizeLocalStorage();
  const { subscribe, update } = localStorageStore<Settings>(SETTINGS_STORE_NAME, initialState);

  function setColorScheme(colorScheme: ColorScheme): void {
    update((settings) => ({ ...settings, colorScheme }));
  }

  function setPreferredUnits(preferredUnits: MeasurementSystem): void {
    update((settings) => ({ ...settings, preferredUnits }));
  }

  function sanitizeLocalStorage(): void {
    if (!browser) {
      return;
    }

    function persist(settings: Settings): void {
      localStorage.setItem(SETTINGS_STORE_NAME, JSON.stringify(settings));
    }

    const settingsValue = localStorage.getItem(SETTINGS_STORE_NAME);
    if (!settingsValue) {
      return;
    }

    try {
      const settings = JSON.parse(settingsValue) as Partial<Settings>;

      if (!('colorScheme' in settings) || !isColorScheme(settings.colorScheme)) {
        settings.colorScheme = 'system';
      }

      if (!('preferredUnits' in settings) || !isMeasurementSystem(settings.preferredUnits)) {
        settings.preferredUnits = 'metric';
      }

      persist(settings as Settings);
    } catch (error) {
      persist(initialState);
    }
  }

  return {
    subscribe,
    setColorScheme,
    setPreferredUnits,
  };
}
