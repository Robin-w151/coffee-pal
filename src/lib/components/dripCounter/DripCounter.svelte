<script lang="ts">
  import PageCard from '../shared/elements/page/PageCard.svelte';
  import PageHeader from '../shared/elements/page/PageHeader.svelte';
  import Counter from './Counter.svelte';
  import Estimation from './Estimation.svelte';

  let dropsPerMinute: number;
  let isWithinRange: boolean;
</script>

<PageHeader title="Drip Counter" />
<PageCard display="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4">
  <Counter {isWithinRange} bind:dropsPerMinute />
  <hr class="md:divider-vertical md:h-full" />
  <Estimation {dropsPerMinute} bind:isWithinRange />
</PageCard>
