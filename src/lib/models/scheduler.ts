export interface Scheduler {
  scheduleExecution: SchedulerFn;
  clearScheduledExecution: SchedulerFn;
  pauseScheduledTask: SchedulerFn;
  resumeScheduledTask: SchedulerFn;
}

export interface ScheduledTask {
  id: symbol;
  task: Task;
  scheduled: boolean;
  paused: boolean;
  timeout?: ReturnType<typeof setTimeout>;
}

export type SchedulerFn = () => void;
export type Task = () => void;
