<script lang="ts">
  export let display = 'flex flex-col gap-4';
  export let padding = 'p-4';
</script>

<div class="card {display} {padding} w-full {$$props.class ?? ''}">
  <slot />
</div>
