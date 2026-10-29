<script lang="ts">
  // Maps to Skeleton v4/v5 `Switch`.
  import { Switch } from '@skeletonlabs/skeleton-svelte';

  interface Props {
    checked?: boolean;
    name: string;
    /** Accessible name; the visible label stays at the call site. */
    label: string;
    onCheckedChange?: (checked: boolean) => void;
  }

  const STRETCHED_INPUT =
    'inset: 0; width: 100%; height: 100%; margin: 0; clip: auto; opacity: 0; z-index: 1; cursor: pointer';

  let { checked = $bindable(false), name, label, onCheckedChange }: Props = $props();

  function handleCheckedChange(details: { checked: boolean }): void {
    checked = details.checked;
    onCheckedChange?.(checked);
  }
</script>

<Switch class="relative" {name} {checked} onCheckedChange={handleCheckedChange}>
  <Switch.Control>
    <Switch.Thumb />
  </Switch.Control>
  <Switch.Label class="sr-only">{label}</Switch.Label>
  <!-- v4 renders a 1px checkbox; the role keeps v2's switch semantics. Stretched transparently over
       the root, it receives clicks itself instead of sitting under the control. -->
  <Switch.HiddenInput role="switch" style={STRETCHED_INPUT} />
</Switch>
