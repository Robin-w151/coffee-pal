import type { ToastSettings, ToastStore } from '@skeletonlabs/skeleton';

export class ToastHelper {
  private store?: ToastStore;

  constructor(toastStore?: ToastStore) {
    if (toastStore) {
      this.store = toastStore;
    }
  }

  public init(toastStore: ToastStore): void {
    this.store = toastStore;
  }

  public triggerInfo(message: string, options?: Partial<ToastSettings>): string {
    this.checkInitialized();

    return this.store!.trigger({
      ...options,
      message,
      background: 'variant-filled-primary',
    });
  }

  public triggerError(message: string, options?: Partial<ToastSettings>): string {
    this.checkInitialized();

    return this.store!.trigger({
      ...options,
      message,
      background: 'variant-filled-error',
    });
  }

  private checkInitialized(): void {
    if (!this.store) {
      throw new Error('ToastHelper not initialized!');
    }
  }
}

export const toastHelper = new ToastHelper();
