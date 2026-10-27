import { browser } from '$app/environment';
import type { MeasurementSystem } from '$lib/models/measurement';
import {
  isColorScheme,
  type ColorScheme,
  type Settings,
  isMeasurementSystem,
} from '$lib/models/settings';
import { PersistedState } from 'runed';
import { getContext, setContext } from 'svelte';
import { JSON_SERIALIZER, updatePersistedState } from './persisted';

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

  get colorScheme(): ColorScheme {
    return this.state.current.colorScheme;
  }

  get preferredUnits(): MeasurementSystem {
    return this.state.current.preferredUnits;
  }

  setColorScheme = (colorScheme: ColorScheme): void => {
    updatePersistedState(this.state, (settings) => ({ ...settings, colorScheme }));
  };

  setPreferredUnits = (preferredUnits: MeasurementSystem): void => {
    updatePersistedState(this.state, (settings) => ({ ...settings, preferredUnits }));
  };
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
