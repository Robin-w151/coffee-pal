import type { Component } from 'svelte';

export interface TriggerModalOptions {
  props?: Record<string, unknown>;
  response?: (response?: any) => void;
}

export interface TriggerConfirmOptions {
  /** Applies the destructive styling to the confirm button. */
  dangerous?: boolean;
}

interface ComponentRequest {
  kind: 'component';
  component: Component<any>;
  props?: Record<string, unknown>;
  response?: (response?: any) => void;
}

interface ConfirmRequest {
  kind: 'confirm';
  title: string;
  body: string;
  dangerous: boolean;
  response: (confirmed: boolean) => void;
}

export type ModalRequest = ComponentRequest | ConfirmRequest;

/**
 * Imperative dialog service.
 *
 * Skeleton v5 removed the global modal store; dialogs are plain components
 * now. This keeps the call sites imperative by holding the pending request in
 * a rune that `GlobalDialog.svelte` renders.
 */
export class ModalHelper {
  current = $state<ModalRequest | undefined>(undefined);

  public triggerModal(component: Component<any>, options?: TriggerModalOptions): void {
    const { props, response } = options ?? {};
    this.current = { kind: 'component', component, props, response };
  }

  public triggerConfirm(
    title: string,
    body: string,
    options?: TriggerConfirmOptions,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.current = {
        kind: 'confirm',
        title,
        body,
        dangerous: options?.dangerous ?? false,
        response: resolve,
      };
    });
  }

  /**
   * Closes the active dialog, handing `response` back to the caller. A confirm
   * dialog that is dismissed without an answer resolves to `false`.
   */
  public close(response?: any): void {
    const request = this.current;
    this.current = undefined;

    if (!request) {
      return;
    }

    if (request.kind === 'confirm') {
      request.response(response === true);
    } else {
      request.response?.(response);
    }
  }
}

export const modalHelper = new ModalHelper();
