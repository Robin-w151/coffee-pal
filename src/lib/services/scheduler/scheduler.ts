import type { ScheduledTask, Scheduler, Task } from '$lib/models/scheduler';

const DEFAULT_TASK_TIMEOUT = 5_000;

const scheduledTasks = new Map<symbol, ScheduledTask>();

export function setupScheduledTask(id: symbol, task: Task): Scheduler {
  if (!scheduledTasks.has(id)) {
    scheduledTasks.set(id, {
      id,
      task,
      scheduled: false,
      paused: false,
    });
  }

  function scheduleExecution(): void {
    const scheduledTask = scheduledTasks.get(id);
    if (scheduledTask) {
      if (scheduledTask.scheduled) {
        return;
      }

      if (scheduledTask.paused) {
        scheduledTasks.set(id, { ...scheduledTask, scheduled: true, timeout: undefined });
      } else {
        const timeout = setTimeout(() => executeTask(), DEFAULT_TASK_TIMEOUT);
        scheduledTasks.set(id, { ...scheduledTask, scheduled: true, timeout });
      }
    }
  }

  function clearScheduledExecution(): void {
    const scheduledTask = scheduledTasks.get(id);
    if (scheduledTask) {
      if (scheduledTask.timeout) {
        clearTimeout(scheduledTask.timeout);
      }

      scheduledTasks.set(id, {
        ...scheduledTask,
        scheduled: false,
        paused: false,
        timeout: undefined,
      });
    }
  }

  function pauseScheduledTask(): void {
    const scheduledTask = scheduledTasks.get(id);
    if (scheduledTask) {
      if (scheduledTask.timeout) {
        clearTimeout(scheduledTask.timeout);
      }

      scheduledTasks.set(id, { ...scheduledTask, paused: true, timeout: undefined });
    }
  }

  function resumeScheduledTask(): void {
    const scheduledTask = scheduledTasks.get(id);
    if (!scheduledTask?.paused) {
      return;
    }

    if (!scheduledTask.scheduled) {
      scheduledTasks.set(id, { ...scheduledTask, paused: false });
    }

    if (scheduledTask.scheduled) {
      const timeout = setTimeout(() => executeTask(), DEFAULT_TASK_TIMEOUT);
      scheduledTasks.set(id, { ...scheduledTask, paused: false, timeout });
    }
  }

  function executeTask(): void {
    const scheduledTask = scheduledTasks.get(id);
    if (!scheduledTask?.scheduled || scheduledTask.paused) {
      return;
    }

    scheduledTask.task();
    scheduledTasks.set(id, { ...scheduledTask, scheduled: false, timeout: undefined });
  }

  return {
    scheduleExecution,
    clearScheduledExecution,
    pauseScheduledTask,
    resumeScheduledTask,
  };
}
