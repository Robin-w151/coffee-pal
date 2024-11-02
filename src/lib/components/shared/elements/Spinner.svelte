<script lang="ts">
  import { ConicGradient } from '@skeletonlabs/skeleton';

  interface Props {
    width?: string;
    color?: string;
    class?: string;
  }

  let { width = 'w-6', color = 'rgb(var(--color-primary-500))', class: clazz }: Props = $props();

  let stops = $derived(conicStops(color));

  function conicStops(color: string) {
    return [
      { color: 'transparent', start: 0, end: 25 },
      { color: `${color}`, start: 75, end: 100 },
    ];
  }
</script>

<ConicGradient class={clazz ?? undefined} {stops} {width} spin />
