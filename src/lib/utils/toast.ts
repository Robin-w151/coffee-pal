import { toastStore, type ToastSettings } from '@skeletonlabs/skeleton';

export function triggerInfo(message: string, options?: Partial<ToastSettings>): void {
  toastStore.trigger({
    ...options,
    message,
    background: 'variant-filled-primary',
  });
}

export function triggerError(message: string, options?: Partial<ToastSettings>): void {
  toastStore.trigger({
    ...options,
    message,
    background: 'variant-filled-error',
  });
}
