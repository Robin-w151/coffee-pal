import { z } from 'zod';
import { Journal } from './journal';
import { MyCoffees } from './myCoffees';

export const Backup = z.object({
  journal: Journal.optional(),
  myCoffees: MyCoffees.optional(),
});
export type Backup = z.infer<typeof Backup>;
