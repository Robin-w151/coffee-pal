<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import TagsInput from '$lib/components/shared/ui/TagsInput.svelte';
  import { getAromaColor } from '$lib/services/myCoffees/colors/colors';

  interface Props {
    aromas?: Array<string>;
  }

  let { aromas = $bindable() }: Props = $props();
</script>

<Label text="Aromas">
  <div data-testid="aromas">
    <TagsInput
      name="aromas"
      placeholder="Aromas, e.g. Nutty, Dried Fruit"
      tagColors={getAromaColor}
      bind:value={aromas}
    />
  </div>
</Label>
