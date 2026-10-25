<script lang="ts">
  // Maps to Skeleton v4/v5 `FileUpload`. Phase 1: wraps v2 `FileDropzone`.
  import { faFileArrowUp } from '@fortawesome/free-solid-svg-icons';
  import { FileDropzone } from '@skeletonlabs/skeleton';
  import { Icon } from 'svelte-awesome';

  interface Props {
    file?: File;
    name: string;
    accept: string;
    /** Hint below the message, e.g. the allowed file type. */
    hint?: string;
  }

  let { file = $bindable(), name, accept, hint }: Props = $props();

  let files = $state<FileList>();
</script>

<FileDropzone
  {name}
  {accept}
  bind:files={
    () => (file ? files : undefined),
    (newFiles) => {
      files = newFiles;
      file = newFiles?.[0];
    }
  }
>
  {#snippet lead()}
    <Icon data={faFileArrowUp} scale={1.5} />
  {/snippet}
  {#snippet message()}
    <span>{file ? file.name : 'Click to select file or drag and drop'}</span>
  {/snippet}
  {#snippet meta()}
    {hint}
  {/snippet}
</FileDropzone>
