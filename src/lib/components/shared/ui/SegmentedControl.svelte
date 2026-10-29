<script lang="ts" generics="TValue extends string">
  // Maps to Skeleton v4/v5 `SegmentedControl`.
  import { SegmentedControl } from '@skeletonlabs/skeleton-svelte';

  interface Props {
    value: TValue;
    options: ReadonlyArray<{ value: TValue; label: string }>;
    name: string;
  }

  let { value = $bindable(), options, name }: Props = $props();

  function handleValueChange(details: { value: string | null }): void {
    const option = options.find((candidate) => candidate.value === details.value);
    if (option) {
      value = option.value;
    }
  }
</script>

<SegmentedControl class="sm:min-w-96" {name} {value} onValueChange={handleValueChange}>
  <SegmentedControl.Control>
    <SegmentedControl.Indicator />
    {#each options as option (option.value)}
      <SegmentedControl.Item value={option.value}>
        <SegmentedControl.ItemText>{option.label}</SegmentedControl.ItemText>
        <SegmentedControl.ItemHiddenInput />
      </SegmentedControl.Item>
    {/each}
  </SegmentedControl.Control>
</SegmentedControl>
