<script lang="ts">
  import type { ButtonType } from '$lib/models/html';

  export let type: ButtonType = undefined;
  export let disabled = false;

  export let label: string;
  export let variant = 'variant-filled';
</script>

<button
  class="btn max-md:btn-icon {variant} {$$props.class ?? ''}"
  {type}
  {disabled}
  title={label}
  on:click
>
  <slot name="icon" />
  <span class="hidden md:inline">{label}</span>
</button>
