import type { ToastSettings, ToastStore } from '@skeletonlabs/skeleton';

export class ToastHelper {
  constructor(private readonly store: ToastStore) {}

  public triggerInfo(message: string, options?: Partial<ToastSettings>): string {
    return this.store.trigger({
      ...options,
      message,
      background: 'variant-filled-primary',
    });
  }

  public triggerError(message: string, options?: Partial<ToastSettings>): string {
    return this.store.trigger({
      ...options,
      message,
      background: 'variant-filled-error',
    });
  }
}
