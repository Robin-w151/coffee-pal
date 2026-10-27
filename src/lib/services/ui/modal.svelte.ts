// A module-level singleton instead of context accessors: modals are opened after `await`s in
// callbacks and from services, where getContext isn't available.
import type { Component } from 'svelte';
import { v4 as uuid } from 'uuid';

export interface ConfirmOptions {
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  dangerous?: boolean;
}

/** Props a custom modal component receives from `modal.open` in addition to its own. */
export interface CustomModalProps<TResult> {
  close: (result?: TResult) => void;
}

/** The result type of a custom modal component, taken from its `close` prop. */
export type ModalResult<TProps> = TProps extends CustomModalProps<infer TResult> ? TResult : never;

export type ModalRequest =
  | { id: string; kind: 'confirm'; options: ConfirmOptions }
  | {
      id: string;
      kind: 'component';
      component: Component<any>;
      props: Record<string, unknown>;
    };

export interface ModalServiceInterface {
  /** The modal to show now; the others wait in the queue. */
  readonly current: ModalRequest | undefined;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  /** Resolves with the value the component passes to `close`, or undefined on backdrop/Escape. */
  open: <TProps extends CustomModalProps<any>>(
    component: Component<TProps>,
    props: Omit<TProps, 'close'>,
  ) => Promise<ModalResult<TProps> | undefined>;
  /** Closes the current modal; `result` resolves its promise (confirm: anything but true is false). */
  close: (result?: unknown) => void;
}

interface QueuedModal {
  request: ModalRequest;
  resolve: (result: unknown) => void;
}

export class ModalService implements ModalServiceInterface {
  private queue = $state<Array<QueuedModal>>([]);

  get current(): ModalRequest | undefined {
    return this.queue[0]?.request;
  }

  confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      this.enqueue({ id: uuid(), kind: 'confirm', options }, (result) => resolve(result === true));
    });
  };

  open = <TProps extends CustomModalProps<any>>(
    component: Component<TProps>,
    props: Omit<TProps, 'close'>,
  ): Promise<ModalResult<TProps> | undefined> => {
    return new Promise((resolve) => {
      this.enqueue(
        { id: uuid(), kind: 'component', component: component as Component<any>, props },
        (result) => resolve(result as ModalResult<TProps> | undefined),
      );
    });
  };

  close = (result?: unknown): void => {
    const [current, ...rest] = this.queue;
    if (!current) {
      return;
    }

    this.queue = rest;
    current.resolve(result);
  };

  private enqueue(request: ModalRequest, resolve: (result: unknown) => void): void {
    this.queue = [...this.queue, { request, resolve }];
  }
}

export const modal = new ModalService();
