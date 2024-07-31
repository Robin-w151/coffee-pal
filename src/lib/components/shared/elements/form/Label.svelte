<script lang="ts">
  import { faWarning } from '@fortawesome/free-solid-svg-icons';
  import { Icon } from 'svelte-awesome';

  export let text: string;
  export let error = false;
  export let errorMessage: string | undefined = undefined;
  export let preventDefault = false;

  function handleClick(event: Event): void {
    if (preventDefault) {
      event.preventDefault();
    }
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<label class="flex flex-col gap-1 @container {$$props.class ?? ''}" on:click={handleClick}>
  <div class="flex flex-col @md:flex-row @md:justify-between @md:gap-4 mr-3">
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
