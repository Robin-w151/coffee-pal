<script lang="ts" module>
  type Side = 'top' | 'bottom' | 'left' | 'right';
  export type PopoverPlacement = Side | `${Side}-start` | `${Side}-end`;

  /** Props to spread onto the trigger element. */
  export type PopoverTriggerProps = Record<string, unknown>;
</script>

<script lang="ts">
  // Maps to Skeleton v4/v5 `Popover`.
  import { Popover, Portal } from '@skeletonlabs/skeleton-svelte';
  import type { Snippet } from 'svelte';

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
  const ids = { trigger: `popover-${id}-trigger`, content: `popover-${id}-content` };

  let open = $state(false);

  function setOpen(value: boolean): void {
    if (open !== value) {
      open = value;
      onOpenChange?.(value);
    }
  }

  // Closing on Escape and outside clicks is handled here, not by the Popover: it reacts to them only
  // once it has set itself up after opening, so early input would be lost.
  function handleWindowKeydown(event: KeyboardEvent): void {
    if (open && event.key === 'Escape') {
      setOpen(false);
    }
  }

  function handleWindowPointerdown(event: PointerEvent): void {
    const target = event.target instanceof Element ? event.target : null;
    if (open && !target?.closest(`#${ids.trigger}, #${ids.content}`)) {
      setOpen(false);
    }
  }

  // Choosing something in the content (click or Enter) closes the popover, as v2's popups did.
  function handleContentClick(event: MouseEvent): void {
    if (event.target !== event.currentTarget) {
      setOpen(false);
    }
  }

  function handleContentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      setOpen(false);
    }
  }
</script>

<svelte:window onkeydown={handleWindowKeydown} onpointerdown={handleWindowPointerdown} />

<Popover
  {ids}
  {open}
  closeOnEscape={false}
  closeOnInteractOutside={false}
  onOpenChange={(details) => setOpen(details.open)}
  modal={trapFocus}
  positioning={{ placement, sameWidth: matchWidth }}
>
  <Popover.Trigger>
    {#snippet element(attributes)}
      {@render trigger(
        openOn === 'focus-click' ? { ...attributes, onfocus: () => setOpen(true) } : attributes,
      )}
    {/snippet}
  </Popover.Trigger>
  <Portal disabled={!portal}>
    <Popover.Positioner>
      <Popover.Content
        class={contentClass}
        onclick={handleContentClick}
        onkeydown={handleContentKeydown}
      >
        {@render content()}
      </Popover.Content>
    </Popover.Positioner>
  </Portal>
</Popover>
