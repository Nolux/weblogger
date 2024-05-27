<script>
  import { fade } from "svelte/transition";
  import { AlertsStore } from "$lib/stores/alertsStore.js";
</script>

{#if $AlertsStore}
  <div
    class="fixed w-full lg:left-40 flex flex-col gap-2 justify-center items-center top-6 z-50"
  >
    {#each Object.keys($AlertsStore) as id, i (i)}
      <div
        role="alert"
        class="alert alert-{$AlertsStore[id].type} w-5/6 lg:w-4/6 top-5 z-50"
        transition:fade
      >
        {$AlertsStore[id].text}
      </div>
    {/each}
  </div>
{/if}
