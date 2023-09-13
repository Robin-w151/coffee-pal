<script lang="ts">
  export let text: string;
</script>

<label class="flex flex-col gap-1 {$$props.class ?? ''}">
  <span>{text}</span>
  <slot />
</label>
