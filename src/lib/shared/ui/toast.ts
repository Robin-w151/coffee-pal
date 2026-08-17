import { createToaster } from '@skeletonlabs/skeleton-svelte';

export type ToastStatus = 'visible' | 'dismissing' | 'unmounted';

export interface ToastAction {
  label: string;
  response: () => void;
}

export interface ToastOptions {
  /** Action button rendered next to the message. */
  action?: ToastAction;
  /** Keep the toast on screen until it is dismissed explicitly. */
  autohide?: boolean;
  /** Time in milliseconds before the toast dismisses itself. */
  timeout?: number;
  /** Called whenever the toast changes status. */
  callback?: (response: { status: ToastStatus }) => void;
}

/**
 * Global toaster instance.
 *
 * Skeleton v5 dropped the global toast store, so the toaster is created once
 * at module load and rendered by `GlobalToaster.svelte`.
 */
export const toaster = createToaster({ placement: 'bottom-end', max: 5 });

export class ToastHelper {
  public triggerInfo(message: string, options?: ToastOptions): string {
    return this.trigger('info', message, options);
  }

  public triggerError(message: string, options?: ToastOptions): string {
    return this.trigger('error', message, options);
  }

  public close(id: string): void {
    toaster.dismiss(id);
  }

  private trigger(type: 'info' | 'error', message: string, options?: ToastOptions): string {
    const { action, autohide, timeout, callback } = options ?? {};

    return toaster.create({
      type,
      description: message,
      duration: autohide === false ? Number.MAX_SAFE_INTEGER : timeout,
      action: action ? { label: action.label, onClick: action.response } : undefined,
      onStatusChange: callback ? (details) => callback({ status: details.status }) : undefined,
    });
  }
}

export const toastHelper = new ToastHelper();
