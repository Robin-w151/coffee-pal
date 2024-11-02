<script lang="ts">
  import { calculateRatio } from '$lib/shared/math';

  interface Props {
    coffee?: number;
    water?: number;
  }

  let { coffee, water }: Props = $props();
</script>

<div class="flex items-center gap-2">
  <span class="badge variant-soft-tertiary h-11 text-base px-4">
    <span class="hidden md:inline">Ratio:&nbsp;</span>
    <span class="!m-0">{calculateRatio(coffee, water) ?? 'unknown'}</span>
  </span>
</div>
