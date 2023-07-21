<script lang="ts">
  import type { Recipe } from '$lib/models/recipe';
  import { createEventDispatcher } from 'svelte';

  export let recipe: Recipe;

  const dispatch = createEventDispatcher();

  let coffee = recipe.coffee;
  let water = recipe.water;
  let output = recipe.output;

  $: handleRecipeChange(recipe);

  function handleRecipeChange(recipe: Recipe): void {
    coffee = recipe.coffee;
    water = recipe.water;
    output = recipe.output;
  }

  function handleCoffeeChange(): void {
    dispatch('coffeeChange', coffee);
  }

  function handleWaterChange(): void {
    dispatch('waterChange', water);
  }

  function handleOutputChange(): void {
    dispatch('outputChange', output);
  }
</script>

<h3 class="h3">Recipe</h3>
<form class="flex flex-col gap-4">
  <label>
    <span>Water</span>
    <input
      class="input"
      type="number"
      bind:value={water}
      on:change={handleWaterChange}
      on:blur={handleWaterChange}
    />
  </label>
  <label>
    <span>Coffee</span>
    <input
      class="input"
      type="number"
      bind:value={coffee}
      on:change={handleCoffeeChange}
      on:blur={handleCoffeeChange}
    />
  </label>
  <label>
    <span>Output</span>
    <input
      class="input"
      type="number"
      bind:value={output}
      on:change={handleOutputChange}
      on:blur={handleOutputChange}
    />
  </label>
</form>
