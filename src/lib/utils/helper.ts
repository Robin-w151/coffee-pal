import { modalStore, type ModalComponent, type ModalSettings } from '@skeletonlabs/skeleton';

export interface TriggerModalOptions {
  props?: any;
  response?: (r: any) => void;
}

export function triggerModal(ref: any, options?: TriggerModalOptions): void {
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

  modalStore.trigger(newModal);
}
