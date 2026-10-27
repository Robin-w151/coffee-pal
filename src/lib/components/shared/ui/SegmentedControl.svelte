<script lang="ts" generics="TValue extends string">
  // Maps to Skeleton v4/v5 `SegmentedControl`. Phase 1: wraps v2 `RadioGroup`/`RadioItem`.
  import { Segment } from '@skeletonlabs/skeleton-svelte';

  interface Props {
    value: TValue;
    options: ReadonlyArray<{ value: TValue; label: string }>;
    name: string;
  }

  let { value = $bindable(), options, name }: Props = $props();
</script>

<Segment flexDirection="flex-col sm:flex-row" class="sm:min-w-96">
  {#each options as option (option.value)}
    <Segment.Item {name} value={option.value} bind:group={value}>{option.label}</Segment.Item>
  {/each}
</Segment>
