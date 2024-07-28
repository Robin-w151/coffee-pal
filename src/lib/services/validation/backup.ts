import { Backup } from '$lib/models/backup';

export async function isValidBackup(backup: unknown): Promise<boolean> {
  const result = await Backup.safeParseAsync(backup);
  if (result.error) {
    console.warn(result.error);
  }
  return result.success;
}
