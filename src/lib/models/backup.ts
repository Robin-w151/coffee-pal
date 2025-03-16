import { type } from 'arktype';
import { Journal } from './journal';
import { MyCoffees } from './myCoffees';

export const Backup = type({
  journal: Journal.optional(),
  myCoffees: MyCoffees.optional(),
});
export type Backup = typeof Backup.infer;
