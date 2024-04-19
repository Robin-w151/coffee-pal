<div class="@container">
  <form
    class="flex flex-col gap-4 @3xl:grid @3xl:grid-cols-2 {$$props.class ?? ''}"
    on:submit|preventDefault
  >
    <slot />
  </form>
</div>
