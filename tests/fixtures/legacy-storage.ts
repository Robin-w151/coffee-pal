/**
 * localStorage values exactly as Skeleton v2 `localStorageStore` writes them (`JSON.stringify`
 * of the store value), captured from the app on 2026-10-25. Don't change these: they guard that
 * users who saved settings or a sync connection before the migration keep them.
 */
export const legacyStorage = {
  settings: '{"colorScheme":"dark","preferredUnits":"imperial"}',
  sync: '{"connection":{"server":{"url":"https://cloud.example.test","provider":"nextcloud"},"credentials":{"username":"legacy-user","password":"legacy-app-password"},"lastSync":"2026-10-24T08:15:00.000+02:00"}}',
} as const;

export const legacySyncHost = 'https://cloud.example.test';
