<script lang="ts">
  import type { ButtonType } from '$lib/models/html';

  export let type: ButtonType = undefined;
  export let disabled = false;

  export let label: string;
  export let title: string | undefined = undefined;
  export let variant = 'variant-filled';
</script>

<button
  class="btn max-lg:btn-icon {variant} {$$props.class ?? ''}"
  {type}
  {disabled}
  title={title || label}
  on:click
>
  <slot name="icon" />
  <span class="hidden lg:inline">{label}</span>
</button>
