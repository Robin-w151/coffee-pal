<script lang="ts">
  // Maps to Skeleton v4/v5 `Switch`. Phase 1: wraps v2 `SlideToggle`.
  import { SlideToggle } from '@skeletonlabs/skeleton';

  interface Props {
    checked?: boolean;
    name: string;
    /** Accessible name; the visible label stays at the call site. */
    label: string;
    onCheckedChange?: (checked: boolean) => void;
  }

  let { checked = $bindable(false), name, label, onCheckedChange }: Props = $props();
</script>

<SlideToggle
  {name}
  {label}
  size="sm"
  active="bg-primary-500 dark:bg-primary-600"
  bind:checked
  on:change={() => onCheckedChange?.(checked)}
/>
