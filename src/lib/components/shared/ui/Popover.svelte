<script lang="ts" module>
  /** Props to spread onto the trigger element. */
  export type PopoverTriggerProps = Record<string, unknown>;
</script>

<script lang="ts">
  // Maps to Skeleton v4/v5 `Popover`.
  import { Popover } from '@skeletonlabs/skeleton-svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    trigger: Snippet<[PopoverTriggerProps]>;
    content: Snippet;
  }

  let { trigger, content }: Props = $props();

  const id = $props.id();
  const ids = { trigger: `popover-${id}-trigger`, content: `popover-${id}-content` };

  let open = $state(false);

  // Closing on Escape and outside clicks is handled here, not by the Popover: it reacts to them only
  // once it has set itself up after opening, so early input would be lost.
  function handleWindowKeydown(event: KeyboardEvent): void {
    if (open && event.key === 'Escape') {
      open = false;
    }
  }

  function handleWindowPointerdown(event: PointerEvent): void {
    const target = event.target instanceof Element ? event.target : null;
    if (open && !target?.closest(`#${ids.trigger}, #${ids.content}`)) {
      open = false;
    }
  }

  // Choosing something in the content (click or Enter) closes the popover, as v2's popups did.
  function handleContentClick(event: MouseEvent): void {
    if (event.target !== event.currentTarget) {
      open = false;
    }
  }

  function handleContentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      open = false;
    }
  }
</script>

<svelte:window onkeydown={handleWindowKeydown} onpointerdown={handleWindowPointerdown} />

<Popover
  {ids}
  {open}
  closeOnEscape={false}
  closeOnInteractOutside={false}
  onOpenChange={(details) => (open = details.open)}
>
  <Popover.Trigger>
    {#snippet element(attributes)}
      {@render trigger(attributes)}
    {/snippet}
  </Popover.Trigger>
  <Popover.Positioner>
    <Popover.Content
      class="card p-4 bg-surface-200-800 shadow-xl z-10"
      onclick={handleContentClick}
      onkeydown={handleContentKeydown}
    >
      {@render content()}
    </Popover.Content>
  </Popover.Positioner>
</Popover>
