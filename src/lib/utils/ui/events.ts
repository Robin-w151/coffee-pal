import type { ActionReturn } from 'svelte/action';

export function installEventHandler(
  node: HTMLElement,
  options: {
    selector: string;
    event: string;
    handler: (event: any) => void;
  },
): ActionReturn {
  const element = node.querySelector(options.selector);
  element?.addEventListener(options.event, options.handler);

  return {
    destroy() {
      element?.removeEventListener(options.event, options.handler);
    },
  };
}
