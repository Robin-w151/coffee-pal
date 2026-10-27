<script lang="ts">
  // Maps to Skeleton v4/v5 `Switch`. Phase 2: a native checkbox until story 15.
  interface Props {
    checked?: boolean;
    name: string;
    /** Accessible name; the visible label stays at the call site. */
    label: string;
    onCheckedChange?: (checked: boolean) => void;
  }

  let { checked = $bindable(false), name, label, onCheckedChange }: Props = $props();
</script>

<!-- MIGRATION_PLACEHOLDER: Switch -->
<input
  type="checkbox"
  role="switch"
  {name}
  aria-label={label}
  bind:checked
  onchange={() => onCheckedChange?.(checked)}
/>
