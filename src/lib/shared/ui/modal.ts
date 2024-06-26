import type { ModalComponent, ModalSettings, ModalStore } from '@skeletonlabs/skeleton';

export interface TriggerModalOptions {
  props?: any;
  response?: (r: any) => void;
}

export class ModalHelper {
  constructor(private readonly store: ModalStore) {}

  public triggerModal(ref: any, options?: TriggerModalOptions): void {
    const { props, response } = options ?? {};

    const modalComponent: ModalComponent = {
      ref,
      props,
    };

    const newModal: ModalSettings = {
      type: 'component',
      component: modalComponent,
      response,
    };

    this.store.trigger(newModal);
  }

  public triggerConfirm(
    title: string,
    body: string,
    settings?: Partial<ModalSettings>,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.store.trigger({
        ...settings,
        type: 'confirm',
        title,
        body,
        response: resolve,
      });
    });
  }
}
