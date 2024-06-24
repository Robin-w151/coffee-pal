<script lang="ts">
  import { HOST_REGEXP } from '$lib/config/regexp';
  import type { Scheme, UrlInputChange } from '$lib/models/urlInput';
  import { faArrowUpRightFromSquare, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-awesome';

  export let url: string | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let readonly = false;

  const availableSchemes = ['https:', 'http:'] satisfies Array<Scheme>;
  const dispatch = createEventDispatcher();

  let [scheme, host] = getSchemeAndHost(url);
  let inputTouched = false;

  $: hostValid = isHostValid(host);
  $: schemeIcon = scheme === 'https:' ? faLock : faLockOpen;
  $: handleChange(scheme, host);

  function handleChange(scheme: Scheme, host: string): void {
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

  function getSchemeAndHost(url?: string | null): [Scheme, string] {
    if (!url) {
      return [availableSchemes[0], ''];
    }

    const parsedUrl = new URL(url);
    return [parsedUrl.protocol as Scheme, parsedUrl.host];
  }
</script>

<div
  class="input-group input-group-divider grid-cols-[auto_1fr_auto]"
  class:input-error={inputTouched && !hostValid}
>
  {#if readonly}
    <div class="input-group-shim">
      <Icon data={schemeIcon} />
    </div>
  {:else}
    <select bind:value={scheme}>
      {#each availableSchemes as availableScheme}
        <option value={availableScheme}>{availableScheme}//</option>
      {/each}
    </select>
  {/if}
  <input type="text" {placeholder} {readonly} bind:value={host} on:blur={handleInputBlur} />
  {#if host}
    <a class="input-group-shim" href="{scheme}//{host}" target="_blank">
      <Icon data={faArrowUpRightFromSquare} />
    </a>
  {/if}
</div>
