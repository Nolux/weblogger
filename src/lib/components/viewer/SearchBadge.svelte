<script>
  import { AlertsStore } from "$lib/stores/alertsStore";
  import Icon from "@iconify/svelte";
  export let callback;

  let searchInput = "";
  let searchOpen = false;
</script>

{#if searchOpen}
  <label
    class="input input-bordered input-xs flex items-center gap-2 bg-warning"
  >
    <input
      class="grow text-warning-content"
      type="text"
      bind:value={searchInput}
    />
    <button
      class="btn btn-xs btn-warning"
      on:click={() => {
        if (searchInput == "") {
          AlertsStore.addAlert("No search input", "warning");
        } else {
          callback(searchInput);
          searchInput = "";
          searchOpen = false;
        }
      }}
    >
      <Icon icon="mdi:search" style="color: oklch(var(--wac));"></Icon>
    </button>
  </label>
{:else}
  <div class="">
    <div
      class="tooltip tooltip-left flex items-center badge badge-warning hover:brightness-75 cursor-pointer"
      data-tip="Search for filter"
      on:click={() => {
        searchOpen = true;
      }}
    >
      <Icon icon="mdi:add" class="rounded-xl" style="color: oklch(var(--wac))"
      ></Icon>
    </div>
  </div>
{/if}
