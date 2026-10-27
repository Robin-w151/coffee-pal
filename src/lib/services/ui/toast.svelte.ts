// A module-level singleton instead of context accessors: toasts are triggered outside components
// (e.g. sync errors in services/sync/sync.ts) and after `await`s in callbacks, where getContext
// isn't available.

import { v4 as uuid } from 'uuid';

export type ToastKind = 'info' | 'error';

export interface ToastOptions {
  /** Milliseconds until the toast closes by itself (default 5000), ignored when persistent. */
  timeout?: number;
  persistent?: boolean;
  action?: { label: string; onClick: () => void | Promise<void> };
  /** Runs once when the toast closes, whether by timeout, dismiss or its action. */
  onClose?: () => void;
}

export interface ToastMessage {
  id: string;
  kind: ToastKind;
  message: string;
  action?: ToastOptions['action'];
}

export interface ToastServiceInterface {
  /** Open toasts, oldest first. */
  readonly toasts: ReadonlyArray<ToastMessage>;
  info: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  /** Runs the toast's action, then closes it. */
  runAction: (id: string) => Promise<void>;
}

const DEFAULT_TIMEOUT = 5_000;

interface OpenToast {
  message: ToastMessage;
  onClose?: () => void;
  timeoutId?: ReturnType<typeof setTimeout>;
}

export class ToastService implements ToastServiceInterface {
  private open = $state<Array<OpenToast>>([]);

  get toasts(): ReadonlyArray<ToastMessage> {
    return this.open.map(({ message }) => message);
  }

  info = (message: string, options?: ToastOptions): string => {
    return this.add('info', message, options);
  };

  error = (message: string, options?: ToastOptions): string => {
    return this.add('error', message, options);
  };

  dismiss = (id: string): void => {
    const toast = this.open.find(({ message }) => message.id === id);
    if (!toast) {
      return;
    }

    clearTimeout(toast.timeoutId);
    this.open = this.open.filter((open) => open !== toast);
    toast.onClose?.();
  };

  runAction = async (id: string): Promise<void> => {
    const toast = this.open.find(({ message }) => message.id === id);
    if (!toast) {
      return;
    }

    try {
      await toast.message.action?.onClick();
    } finally {
      this.dismiss(id);
    }
  };

  private add(kind: ToastKind, message: string, options: ToastOptions = {}): string {
    const { timeout = DEFAULT_TIMEOUT, persistent = false, action, onClose } = options;
    const id = uuid();
    const timeoutId = persistent ? undefined : setTimeout(() => this.dismiss(id), timeout);

    this.open = [...this.open, { message: { id, kind, message, action }, onClose, timeoutId }];
    return id;
  }
}

export const toast = new ToastService();
