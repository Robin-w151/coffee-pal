<script lang="ts">
  import { ConicGradient } from '@skeletonlabs/skeleton';

  export let width = 'w-6';
  export let color = 'rgb(var(--color-primary-500))';

  $: stops = conicStops(color);

  function conicStops(color: string) {
    return [
      { color: 'transparent', start: 0, end: 25 },
      { color: `${color}`, start: 75, end: 100 },
    ];
  }
</script>

<ConicGradient class={$$props.class ?? undefined} {stops} {width} spin />
