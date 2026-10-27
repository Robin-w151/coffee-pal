<script lang="ts" module>
  import {
    arrow,
    autoUpdate,
    computePosition,
    flip,
    inline,
    offset,
    shift,
    size,
  } from '@floating-ui/dom';
  import type { Attachment } from 'svelte/attachments';

  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow, size, inline });

  type Side = 'top' | 'bottom' | 'left' | 'right';
  export type PopoverPlacement = Side | `${Side}-start` | `${Side}-end`;

  /** Props to spread onto the trigger element. */
  export type PopoverTriggerProps = Record<symbol, Attachment<HTMLElement>>;
</script>

<script lang="ts">
  // Phase 1: Skeleton v2's popup action, attached to the trigger the snippet renders.
  import Portal from '$lib/components/shared/elements/Portal.svelte';
  import { type PopupSettings } from '@skeletonlabs/skeleton-svelte';
  import type { Snippet } from 'svelte';
  import { createAttachmentKey, fromAction } from 'svelte/attachments';

  interface Props {
    trigger: Snippet<[PopoverTriggerProps]>;
    content: Snippet;
    /** `focus-click` opens on focus and click, for inputs with suggestions. */
    openOn?: 'click' | 'focus-click';
    placement?: PopoverPlacement;
    /** Gives the content the width of the trigger. */
    matchWidth?: boolean;
    /** Renders the content at the end of `body`, so no ancestor clips it. */
    portal?: boolean;
    trapFocus?: boolean;
    contentClass?: string;
    onOpenChange?: (open: boolean) => void;
  }

  let {
    trigger,
    content,
    openOn = 'click',
    placement = 'bottom',
    matchWidth = false,
    portal = false,
    trapFocus = false,
    contentClass = 'card p-4 bg-surface-200-800 shadow-xl z-10',
    onOpenChange,
  }: Props = $props();

  const id = $props.id();
  const target = `popover-${id}`;

  const settings: PopupSettings = $derived({
    event: openOn,
    target,
    placement,
    middleware: matchWidth
      ? {
          size: {
            apply: ({ rects, elements }: { rects: any; elements: any }) => {
              Object.assign(elements.floating.style, { width: `${rects.reference.width}px` });
            },
          },
        }
      : undefined,
    state: ({ state }) => {
      onOpenChange?.(state);
    },
  });

  const triggerProps: PopoverTriggerProps = {
    [createAttachmentKey()]: fromAction(popup, () => settings),
  };
</script>

{#snippet popoverContent()}
  <div
    class={contentClass}
    {...trapFocus ? { tabindex: -1 } : {}}
    data-popup={target}
    use:focusTrap={trapFocus}
  >
    {@render content()}
  </div>
{/snippet}

{#if portal}
  <Portal target="body">
    {@render popoverContent()}
  </Portal>
  {@render trigger(triggerProps)}
{:else}
  {@render trigger(triggerProps)}
  {@render popoverContent()}
{/if}
