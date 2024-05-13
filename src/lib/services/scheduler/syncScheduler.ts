import { sync } from '../sync/sync';
import { setupScheduledTask } from './scheduler';

const SYNC = Symbol('sync');

export const {
  scheduleExecution: scheduleSync,
  clearScheduledExecution: clearScheduledSync,
  pauseScheduledTask: pauseScheduledSync,
  resumeScheduledTask: resumeScheduledSync,
} = setupScheduledTask(SYNC, sync);
