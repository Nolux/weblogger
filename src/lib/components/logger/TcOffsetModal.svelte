<script>
  import Icon from "@iconify/svelte";

  import { tcOffsets } from "$lib/stores/tcOffsetStore.js";
</script>

<div class="tooltip tooltip-left" data-tip="Timecode Offset Settings">
  <button class="btn btn-ghost z-10" onclick="tcOffsetModal.showModal()"
    ><Icon icon="mdi:cog" /></button
  >
</div>

<dialog id="tcOffsetModal" class="modal">
  <div class="modal-box flex flex-col gap-4 relative">
    <div class="modal-action absolute top-0 right-6">
      <form method="dialog">
        <button class="btn btn-ghost btn-xs">x</button>
      </form>
    </div>
    <h1 class="font-bold text-xl mb-4">Timecode offset:</h1>
    <label class="input input-bordered flex items-center gap-2">
      Hours: <input
        max="23"
        min="-23"
        type="number"
        class="grow text-right"
        placeholder="Hour"
        bind:value={$tcOffsets.hours}
      /></label
    >
    <label class="input input-bordered flex items-center gap-2">
      Minutes: <input
        max="59"
        min="-59"
        type="number"
        class="grow text-right"
        placeholder="Hour"
        bind:value={$tcOffsets.minutes}
      /></label
    >
    <label class="input input-bordered flex items-center gap-2">
      Seconds: <input
        max="59"
        min="-59"
        type="number"
        class="grow text-right"
        placeholder="Hour"
        bind:value={$tcOffsets.seconds}
      /></label
    >
    <label class="input input-bordered flex items-center gap-2">
      Frames: <input
        max="24"
        min="-24"
        type="number"
        class="grow text-right"
        placeholder="Hour"
        bind:value={$tcOffsets.frames}
      /></label
    >
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
