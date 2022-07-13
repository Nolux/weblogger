<script>
  import { alertStore } from "$lib/store/alertStore";
</script>

<div class="m-6 absolute w-2/4 top-22 left-1/4 drop-shadow-lg">
  <div class="alert alert-warning hidden" />
  <div class="alert alert-success hidden" />
  <div class="alert alert-info hidden" />
  <div class="alert alert-error hidden" />
  {#each $alertStore as alert, i (alert.id)}
    <div
      class={`alert alert-${alert.type} shadow-lg transition-all duration-500 mb-6`}
    >
      <span>{alert.message}</span>
      <button
        class="btn btn-ghost relative top-0 right-0"
        on:click={() => {
          alertStore.remove(i);
        }}>x</button
      >
    </div>
  {/each}
</div>
