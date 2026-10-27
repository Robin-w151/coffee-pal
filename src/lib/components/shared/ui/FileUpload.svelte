<script lang="ts">
  // Maps to Skeleton v4/v5 `FileUpload`. Phase 2: a native file input until story 15.
  interface Props {
    file?: File;
    name: string;
    accept: string;
    /** Hint below the message, e.g. the allowed file type. */
    hint?: string;
  }

  let { file = $bindable(), name, accept, hint }: Props = $props();
</script>

<!-- MIGRATION_PLACEHOLDER: FileUpload -->
<label class="flex flex-col gap-2">
  <span>{file ? file.name : 'Click to select file or drag and drop'}</span>
  <input
    type="file"
    {name}
    {accept}
    onchange={(event) => (file = event.currentTarget.files?.[0])}
  />
  {#if hint}
    <span class="text-sm">{hint}</span>
  {/if}
</label>
