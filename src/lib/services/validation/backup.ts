import schema from '$assets/backup.schema.json';
import type { Backup } from '$lib/models/backup';
import type { Json, Schema, Validate, ValidatorOptions } from '@exodus/schemasafe';

let validator: (schema: Schema, options?: ValidatorOptions) => Validate;

export async function isValidBackup(backup: Backup): Promise<boolean> {
  if (!validator) {
    validator = (await import('@exodus/schemasafe')).validator;
  }

  const validate = validator(schema);
  return validate(backup as Json);
}
