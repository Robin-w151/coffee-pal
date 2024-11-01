<script lang="ts">
  import type { ButtonType } from '$lib/models/html';
  import type { Snippet } from 'svelte';
  import type { MouseEventHandler } from 'svelte/elements';

  interface Props {
    label: string;
    title?: string;
    type?: ButtonType;
    variant?: string;
    disabled?: boolean;
    class?: string;
    iconContent: Snippet;
    onclick?: MouseEventHandler<HTMLButtonElement>;
  }

  let {
    label,
    title,
    type,
    variant = 'variant-filled',
    disabled = false,
    class: clazz,
    iconContent,
    onclick,
  }: Props = $props();
</script>

<button
  class="btn max-lg:btn-icon {variant} {clazz ?? ''}"
  {type}
  {disabled}
  title={title || label}
  {onclick}
>
  {@render iconContent()}
  <span class="hidden lg:inline">{label}</span>
</button>
