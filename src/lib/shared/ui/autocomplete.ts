import type { PopupSettings } from '@skeletonlabs/skeleton';

export const autocompletePopupBaseSettings = {
  event: 'focus-click',
  placement: 'bottom',
  middleware: {
    size: {
      apply: ({ rects, elements }: { rects: any; elements: any }) => {
        Object.assign(elements.floating.style, {
          width: `${rects.reference.width}px`,
        });
      },
    },
  },
} satisfies Partial<PopupSettings>;
