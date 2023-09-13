<script lang="ts">
  import type { UrlInputChange } from '$lib/models/url-input';
  import { HOST_REGEXP } from '$lib/utils/regexp';
  import { createEventDispatcher } from 'svelte';

  export let url: string | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let readonly = false;

  const availableSchemes = ['https:', 'http:'];
  const dispatch = createEventDispatcher();

  let [scheme, host] = getSchemeAndHost(url);
  let inputTouched = false;

  $: hostValid = isHostValid(host);
  $: handleChange(scheme, host);

  function handleChange(scheme: string, host: string): void {
    const change = {
      url: `${scheme}//${host}`,
      scheme,
      host,
      hostValid,
    } satisfies UrlInputChange;

    dispatch('change', change);
  }

  function handleInputBlur(): void {
    inputTouched = true;
  }

  function isHostValid(url: string): boolean {
    return HOST_REGEXP.test(url);
  }

  function getSchemeAndHost(url?: string | null): [string, string] {
    if (!url) {
      return [availableSchemes[0], ''];
    }

    const parsedUrl = new URL(url);
    return [parsedUrl.protocol, parsedUrl.host];
  }
</script>

<div
  class="input-group input-group-divider grid-cols-[auto_1fr]"
  class:input-error={inputTouched && !hostValid}
>
  {#if readonly}
    <div class="input-group-shim">{scheme}//</div>
  {:else}
    <select bind:value={scheme}>
      {#each availableSchemes as availableScheme}
        <option value={availableScheme}>{availableScheme}//</option>
      {/each}
    </select>
  {/if}
  <input type="text" {placeholder} {readonly} bind:value={host} on:blur={handleInputBlur} />
</div>
