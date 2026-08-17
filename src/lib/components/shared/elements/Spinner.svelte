<script lang="ts">
  interface Props {
    width?: string;
    color?: string;
    class?: string;
  }

  let { width = 'w-6', color = 'var(--color-primary-500)', class: clazz }: Props = $props();
</script>

<div
  class="aspect-square rounded-full border-2 border-current border-t-transparent animate-spin {width} {clazz ??
    ''}"
  style:color
  role="status"
  aria-label="Loading"
></div>
