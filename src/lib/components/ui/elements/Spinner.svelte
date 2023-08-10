<script lang="ts">
  import { conicStops } from '$lib/styles/conicGradient';
  import { ConicGradient } from '@skeletonlabs/skeleton';

  export let width = 'w-6';
</script>

<ConicGradient class={$$props.class ?? undefined} stops={conicStops} {width} spin />
