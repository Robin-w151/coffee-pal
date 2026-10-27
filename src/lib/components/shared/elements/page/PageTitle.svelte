<script lang="ts">
  interface Props {
    title: string;
  }

  let { title }: Props = $props();
</script>

<h2 class="h2 flex items-center overflow-hidden">
  <span class="leading-[1.3] overflow-hidden text-ellipsis whitespace-nowrap">{title}</span>
</h2>
