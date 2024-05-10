<script>
  import { fade } from "svelte/transition";
  import { AlertsStore } from "$lib/stores/alertsStore.js";
</script>

{#if $AlertsStore}
  <div
    class="w-full flex flex-col gap-2 justify-center items-center absolute top-6"
  >
    {#each Object.keys($AlertsStore) as id, i (i)}
      <div
        role="alert"
        class="alert alert-{$AlertsStore[id].type} w-5/6 top-5 z-50"
        transition:fade
      >
        {$AlertsStore[id].text}
      </div>
    {/each}
  </div>
{/if}
<!-- 
    <button
  class="btn"
  on:click={() => {
    AlertsStore.addAlert("test", "success", 7000);
    setTimeout(() => {
      AlertsStore.addAlert("ERROR", "error");
    }, 3000);
    setTimeout(() => {
      AlertsStore.addAlert("Info", "info");
    }, 5000);
  }}
></button> 
-->
