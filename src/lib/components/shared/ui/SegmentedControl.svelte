<script lang="ts" generics="TValue extends string">
  // Maps to Skeleton v4/v5 `SegmentedControl`. Phase 1: wraps v2 `RadioGroup`/`RadioItem`.
  import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';

  interface Props {
    value: TValue;
    options: ReadonlyArray<{ value: TValue; label: string }>;
    name: string;
  }

  let { value = $bindable(), options, name }: Props = $props();
</script>

<RadioGroup flexDirection="flex-col sm:flex-row" class="sm:min-w-[24rem]">
  {#each options as option (option.value)}
    <RadioItem {name} value={option.value} bind:group={value}>{option.label}</RadioItem>
  {/each}
</RadioGroup>
