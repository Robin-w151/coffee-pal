<script lang="ts">
  export let text: string;
</script>

<label class="flex flex-col gap-1 {$$props.class ?? ''}">
  <span class="ml-3">{text}</span>
  <slot />
</label>
