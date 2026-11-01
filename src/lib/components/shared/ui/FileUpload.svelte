<script lang="ts">
  // Maps to Skeleton v4/v5 `FileUpload`, with a single file.
  import { faFileArrowUp } from '@fortawesome/free-solid-svg-icons';
  import { FileUpload, useFileUpload } from '@skeletonlabs/skeleton-svelte';
  import { Icon } from 'svelte-awesome';

  interface Props {
    file?: File;
    name: string;
    accept: string;
    /** Hint below the message, e.g. the allowed file type. */
    hint?: string;
  }

  let { file = $bindable(), name, accept, hint }: Props = $props();

  const id = $props.id();
  const fileUpload = useFileUpload(() => ({
    id,
    name,
    accept,
    maxFiles: 1,
    onFileChange: (details) => (file = details.acceptedFiles[0]),
  }));

  // v4 can't control its files, so a file the caller clears (e.g. after an import) is cleared here.
  $effect(() => {
    if (!file && fileUpload().acceptedFiles.length > 0) {
      fileUpload().clearFiles();
    }
  });
</script>

<FileUpload.Provider value={fileUpload}>
  <FileUpload.Dropzone>
    <Icon data={faFileArrowUp} scale={1.5} />
    <span>{file ? file.name : 'Click to select file or drag and drop'}</span>
    {#if hint}
      <span class="text-xs">{hint}</span>
    {/if}
  </FileUpload.Dropzone>
  <FileUpload.HiddenInput />
</FileUpload.Provider>
