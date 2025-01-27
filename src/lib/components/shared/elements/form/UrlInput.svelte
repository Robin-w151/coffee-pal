<script lang="ts">
  import { HOST_REGEXP } from '$lib/config/regexp';
  import type { Scheme, UrlInputChange } from '$lib/models/urlInput';
  import { faArrowUpRightFromSquare, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
  import { Icon } from 'svelte-awesome';

  interface Props {
    url?: string | undefined;
    placeholder?: string | undefined;
    readonly?: boolean;
    onChange?: (urlInputChange: UrlInputChange) => void;
  }

  let { url = undefined, placeholder = undefined, readonly = false, onChange }: Props = $props();

  const availableSchemes = ['https:', 'http:'] satisfies Array<Scheme>;

  let [scheme, host] = $state(getSchemeAndHost(url));
  let inputTouched = $state(false);
  let hostValid = $derived(isHostValid(host));
  let schemeIcon = $derived(scheme === 'https:' ? faLock : faLockOpen);

  $effect(() => {
    handleChange(scheme, host);
  });

  function handleChange(scheme: Scheme, host: string): void {
    onChange?.({
      url: `${scheme}//${host}`,
      scheme,
      host,
      hostValid,
    });
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
      {#each availableSchemes as availableScheme (availableScheme)}
        <option value={availableScheme}>{availableScheme}//</option>
      {/each}
    </select>
  {/if}
  <input
    style="min-width: 6rem !important"
    type="text"
    autocapitalize="off"
    {placeholder}
    {readonly}
    bind:value={host}
    onblur={handleInputBlur}
  />
  {#if host}
    <a class="input-group-shim" href="{scheme}//{host}" target="_blank" title="Open URL">
      <Icon data={faArrowUpRightFromSquare} />
    </a>
  {/if}
</div>
