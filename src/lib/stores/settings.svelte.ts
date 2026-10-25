import { browser } from '$app/environment';
import type { MeasurementSystem } from '$lib/models/measurement';
import {
  isColorScheme,
  type ColorScheme,
  type Settings,
  isMeasurementSystem,
} from '$lib/models/settings';
import { PersistedState } from 'runed';
import { getContext, setContext, untrack } from 'svelte';
import { JSON_SERIALIZER } from './persisted';

export interface SettingsStoreInterface {
  readonly colorScheme: ColorScheme;
  readonly preferredUnits: MeasurementSystem;
  setColorScheme: (colorScheme: ColorScheme) => void;
  setPreferredUnits: (preferredUnits: MeasurementSystem) => void;
}

const SETTINGS_KEY = 'settings';
const DEFAULT_SETTINGS = {
  colorScheme: 'system',
  preferredUnits: 'metric',
} satisfies Settings;

export class SettingsStore implements SettingsStoreInterface {
  private readonly state: PersistedState<Settings>;

  constructor() {
    sanitizeLocalStorage(); // must run before PersistedState reads the value
    this.state = new PersistedState<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS, {
      serializer: JSON_SERIALIZER,
    });
  }

  // Plain getters: PersistedState re-reads storage on every access and tracks it in effects, so a
  // $derived would only add a cache that callers outside effects could see stale.
  get colorScheme(): ColorScheme {
    return this.state.current.colorScheme;
  }

  get preferredUnits(): MeasurementSystem {
    return this.state.current.preferredUnits;
  }

  setColorScheme = (colorScheme: ColorScheme): void => {
    this.update((settings) => ({ ...settings, colorScheme }));
  };

  setPreferredUnits = (preferredUnits: MeasurementSystem): void => {
    this.update((settings) => ({ ...settings, preferredUnits }));
  };

  // Untracked as a whole: setters are called from effects, and reading the PersistedState proxy
  // (also when spreading it) would make the effect depend on the value it writes.
  private update(updater: (settings: Settings) => Settings): void {
    untrack(() => {
      this.state.current = updater(this.state.current);
    });
  }
}

const DEFAULT_KEY = Symbol('root_settings_store');

export function getSettingsStore(key: symbol = DEFAULT_KEY): SettingsStoreInterface {
  return getContext(key);
}

export function setSettingsStore(key: symbol = DEFAULT_KEY): SettingsStoreInterface {
  const settingsStore = new SettingsStore();
  return setContext(key, settingsStore);
}

function sanitizeLocalStorage(): void {
  if (!browser) {
    return;
  }

  function persist(settings: Settings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  const settingsValue = localStorage.getItem(SETTINGS_KEY);
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
  } catch {
    // Not valid JSON: start over with the defaults.
    persist(DEFAULT_SETTINGS);
  }
}
