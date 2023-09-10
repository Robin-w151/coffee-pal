import type { Journal } from './journal';
import type { MyCoffees } from './myCoffees';
import { validator, type Json } from '@exodus/schemasafe';
import schema from '$assets/backup.schema.json';

export interface Backup {
  journal?: Journal;
  myCoffees?: MyCoffees;
}

export function isValidBackup(backup: Backup): backup is Backup {
  const validate = validator(schema);
  return validate(backup as Json);
}
