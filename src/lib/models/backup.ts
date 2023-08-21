import type { Journal } from './journal';
import type { MyCoffees } from './myCoffees';

export interface Backup {
  journal?: Journal;
  myCoffees?: MyCoffees;
}
