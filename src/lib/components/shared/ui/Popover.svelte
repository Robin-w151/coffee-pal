<script lang="ts" module>
  import type { Attachment } from 'svelte/attachments';

  type Side = 'top' | 'bottom' | 'left' | 'right';
  export type PopoverPlacement = Side | `${Side}-start` | `${Side}-end`;

  /** Props to spread onto the trigger element. */
  export type PopoverTriggerProps = Record<symbol, Attachment<HTMLElement>>;
</script>

<script lang="ts">
  // Phase 2: toggles the content next to the trigger (positioned once on open) until story 16.
  import Portal from '$lib/components/shared/elements/Portal.svelte';
  import type { Snippet } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';

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

  let open = $state(false);
  let triggerElement: HTMLElement | undefined;
  let position = $state<Record<string, string>>({});

  function computePosition(): Record<string, string> {
    const rect = triggerElement?.getBoundingClientRect();
    if (!rect) {
      return {};
    }

    const [side, align] = placement.split('-');
    const style: Record<string, string> = { position: 'fixed' };
    if (side === 'top') {
      style.bottom = `${window.innerHeight - rect.top}px`;
    } else {
      style.top = `${rect.bottom}px`;
    }
    if (align === 'end') {
      style.right = `${window.innerWidth - rect.right}px`;
    } else {
      style.left = `${rect.left}px`;
    }
    if (matchWidth) {
      style.width = `${rect.width}px`;
    }
    return style;
  }

  // Keeps Tab inside the content once focus is in it.
  function handleContentKeydown(event: KeyboardEvent & { currentTarget: HTMLElement }): void {
    if (!trapFocus || event.key !== 'Tab') {
      return;
    }

    const focusables = [
      ...event.currentTarget.querySelectorAll<HTMLElement>('button, input, a[href], [tabindex]'),
    ];
    const first = focusables[0];
    const last = focusables.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  function setOpen(value: boolean): void {
    if (open !== value) {
      position = value ? computePosition() : {};
      open = value;
      onOpenChange?.(value);
    }
  }

  const triggerProps: PopoverTriggerProps = {
    [createAttachmentKey()]: (element) => {
      triggerElement = element;
      const toggle = () => setOpen(openOn === 'focus-click' ? true : !open);
      const show = () => setOpen(true);
      const hide = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
      element.addEventListener('click', toggle);
      element.addEventListener('keydown', hide);
      if (openOn === 'focus-click') {
        element.addEventListener('focus', show);
      }
      return () => {
        element.removeEventListener('click', toggle);
        element.removeEventListener('keydown', hide);
        element.removeEventListener('focus', show);
      };
    },
  };

  // Content clicks close it too, like v2 did for the app's popovers (selection lists).
  function closeOnOutsideClick(event: MouseEvent): void {
    if (
      open &&
      !(event.target instanceof Element && event.target.closest('[data-popover-trigger]'))
    ) {
      setOpen(false);
    }
  }
</script>

<svelte:window onclickcapture={closeOnOutsideClick} />

<!-- MIGRATION_PLACEHOLDER: Popover -->
{#snippet popoverContent()}
  {#if open}
    <div
      class={contentClass}
      style={Object.entries(position)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ')}
      role="presentation"
      onkeydown={handleContentKeydown}
    >
      {@render content()}
    </div>
  {/if}
{/snippet}

<span class="contents" data-popover-trigger>
  {@render trigger(triggerProps)}
</span>
{#if portal}
  <Portal target="body">
    {@render popoverContent()}
  </Portal>
{:else}
  {@render popoverContent()}
{/if}
