<script lang="ts">
  interface Props {
    width?: string;
    class?: string;
  }

  let { width = 'w-6', class: clazz = 'text-primary-500' }: Props = $props();
</script>

<!-- Same boxes as the Skeleton v2 conic gradient; the colour comes from currentColor. -->
<div class="flex flex-col items-center {clazz}">
  <div
    class="block aspect-square rounded-full animate-spin {width}"
    style:background="conic-gradient(transparent 0% 25%, currentColor 75% 100%)"
  ></div>
</div>
