<script lang="ts">
  import { faWarning } from '@fortawesome/free-solid-svg-icons';
  import { Icon } from 'svelte-awesome';

  export let text: string;
  export let error = false;
  export let errorMessage: string | undefined = undefined;
</script>

<label class="flex flex-col gap-1 {$$props.class ?? ''}">
  <div class="flex justify-between gap-4 mr-3">
    <span>{text}</span>
    {#if error && errorMessage}
      <span class="flex items-center gap-2 text-error-600-300-token">
        <Icon data={faWarning} />
        {errorMessage}
      </span>
    {/if}
  </div>
  <slot />
</label>
