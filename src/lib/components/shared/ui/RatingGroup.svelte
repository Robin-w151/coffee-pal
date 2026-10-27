<script lang="ts">
  // Maps to Skeleton v4/v5 `RatingGroup`. Phase 2: plain buttons until story 15.
  import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
  import { faStar } from '@fortawesome/free-solid-svg-icons';
  import { Icon } from 'svelte-awesome';

  interface Props {
    value: number;
    max: number;
    /** Called with the clicked star (1-based). */
    onValueChange: (value: number) => void;
  }

  let { value, max, onValueChange }: Props = $props();
</script>

<!-- MIGRATION_PLACEHOLDER: RatingGroup -->
<div class="flex justify-start text-tertiary-700-300">
  {#each { length: max }, index (index)}
    <button type="button" onclick={() => onValueChange(index + 1)}>
      <Icon data={index < value ? faStar : faStarRegular} scale={2} />
    </button>
  {/each}
</div>
