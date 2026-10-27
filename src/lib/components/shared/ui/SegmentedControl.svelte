<script lang="ts" generics="TValue extends string">
  // Maps to Skeleton v4/v5 `SegmentedControl`. Phase 2: native radios until story 15.
  interface Props {
    value: TValue;
    options: ReadonlyArray<{ value: TValue; label: string }>;
    name: string;
  }

  let { value = $bindable(), options, name }: Props = $props();
</script>

<!-- MIGRATION_PLACEHOLDER: SegmentedControl -->
<div class="flex flex-col sm:flex-row gap-4 sm:min-w-96" role="radiogroup">
  {#each options as option (option.value)}
    <label class="flex items-center gap-2">
      <input type="radio" {name} value={option.value} bind:group={value} />
      {option.label}
    </label>
  {/each}
</div>
