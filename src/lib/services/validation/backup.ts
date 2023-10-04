import schema from '$assets/backup.schema.json';
import type { Backup } from '$lib/models/backup';
import { lazyLoad } from '$lib/utils/lazyLoad';
import type { Json } from '@exodus/schemasafe';

const validator = lazyLoad(async () => (await import('@exodus/schemasafe')).validator);

export async function isValidBackup(backup: Backup): Promise<boolean> {
  const validate = (await validator.handle)(schema);
  return validate(backup as Json);
}
