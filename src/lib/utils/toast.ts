import { toastStore } from '@skeletonlabs/skeleton';

export function triggerInfo(message: string): void {
  toastStore.trigger({
    message,
    background: 'variant-filled-primary',
  });
}

export function triggerError(message: string): void {
  toastStore.trigger({
    message,
    background: 'variant-filled-error',
  });
}
