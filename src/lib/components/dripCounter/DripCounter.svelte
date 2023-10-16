<script lang="ts">
  import PageCard from '../ui/elements/page/PageCard.svelte';
  import PageHeader from '../ui/elements/page/PageHeader.svelte';
  import Counter from './Counter.svelte';
  import Estimation from './Estimation.svelte';

  let dropsPerMinute: number;
</script>

<PageHeader title="Drip Counter" />
<PageCard>
  <Counter bind:dropsPerMinute />
  <hr />
  <Estimation {dropsPerMinute} />
</PageCard>
