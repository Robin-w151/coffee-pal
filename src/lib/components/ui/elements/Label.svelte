<script lang="ts">
  export let text: string;
</script>

<label class="flex flex-col gap-1">
  <span class="ml-3">{text}</span>
  <slot />
</label>
