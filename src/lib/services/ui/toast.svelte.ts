// A module-level singleton instead of context accessors: toasts are triggered outside components
// (e.g. sync errors in services/sync/sync.ts) and after `await`s in callbacks, where getContext
// isn't available.

// Kept as its own type: Skeleton v4's toaster uses string ids, so phase 2 changes only this line.
export type ToastId = number; // NOSONAR(typescript:S6564)
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
  id: ToastId;
  kind: ToastKind;
  message: string;
  action?: ToastOptions['action'];
}

export interface ToastServiceInterface {
  /** Open toasts, oldest first. */
  readonly toasts: ReadonlyArray<ToastMessage>;
  info: (message: string, options?: ToastOptions) => ToastId;
  error: (message: string, options?: ToastOptions) => ToastId;
  dismiss: (id: ToastId) => void;
  /** Runs the toast's action, then closes it. */
  runAction: (id: ToastId) => Promise<void>;
}

const DEFAULT_TIMEOUT = 5_000;

interface OpenToast {
  message: ToastMessage;
  onClose?: () => void;
  timeoutId?: ReturnType<typeof setTimeout>;
}

export class ToastService implements ToastServiceInterface {
  private open = $state<Array<OpenToast>>([]);
  private nextId = 1;

  get toasts(): ReadonlyArray<ToastMessage> {
    return this.open.map(({ message }) => message);
  }

  info = (message: string, options?: ToastOptions): ToastId => {
    return this.add('info', message, options);
  };

  error = (message: string, options?: ToastOptions): ToastId => {
    return this.add('error', message, options);
  };

  dismiss = (id: ToastId): void => {
    const toast = this.open.find(({ message }) => message.id === id);
    if (!toast) {
      return;
    }

    clearTimeout(toast.timeoutId);
    this.open = this.open.filter((open) => open !== toast);
    toast.onClose?.();
  };

  runAction = async (id: ToastId): Promise<void> => {
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

  private add(kind: ToastKind, message: string, options: ToastOptions = {}): ToastId {
    const { timeout = DEFAULT_TIMEOUT, persistent = false, action, onClose } = options;
    const id = this.nextId++;
    const timeoutId = persistent ? undefined : setTimeout(() => this.dismiss(id), timeout);

    this.open = [...this.open, { message: { id, kind, message, action }, onClose, timeoutId }];
    return id;
  }
}

export const toast = new ToastService();
