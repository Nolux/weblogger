<script>
  import Icon from "@iconify/svelte";

  import { tcOffsets } from "$lib/stores/tcOffsetStore.js";
  import { timecodeSource } from "$lib/stores/timecodeSourceStore.js";
  import {
    connectLocalLtc,
    disconnectLocalLtc,
    listLocalLtcDevices,
    localLtcState,
  } from "$lib/timecode/ltcClient.js";

  let dialog = $state();

  const selectSource = (mode) => {
    $timecodeSource = { ...$timecodeSource, mode };
    if (mode !== "local-ltc") disconnectLocalLtc();
  };

  const selectDevice = (deviceId) => {
    $timecodeSource = { ...$timecodeSource, ltcDeviceId: deviceId || null };
  };
</script>

<div class="tooltip tooltip-left" data-tip="Timecode Settings">
  <button
    class="btn btn-ghost z-10"
    onclick={async () => {
      dialog.showModal();
      await listLocalLtcDevices();
    }}><Icon icon="mdi:cog" /></button
  >
</div>

<dialog id="timecodeSettingsModal" bind:this={dialog} class="modal">
  <div class="modal-box flex flex-col gap-4 relative">
    <div class="modal-action absolute top-0 right-6">
      <form method="dialog">
        <button class="btn btn-ghost btn-xs">x</button>
      </form>
    </div>
    <h1 class="font-bold text-xl mb-4">Timecode settings</h1>

    <div class="flex flex-col gap-2">
      <div class="font-semibold">Source</div>
      <label class="label cursor-pointer justify-start gap-3">
        <input
          type="radio"
          name="timecode-source"
          class="radio radio-primary"
          checked={$timecodeSource.mode === "browser-clock"}
          onchange={() => selectSource("browser-clock")}
        />
        <span>Browser clock + offset</span>
      </label>
      <label class="label cursor-pointer justify-start gap-3">
        <input
          type="radio"
          name="timecode-source"
          class="radio radio-primary"
          checked={$timecodeSource.mode === "local-ltc"}
          onchange={() => selectSource("local-ltc")}
        />
        <span>Local LTC audio input</span>
      </label>
    </div>

    {#if $timecodeSource.mode === "browser-clock"}
      <div class="divider my-0"></div>
      <div class="font-semibold">Browser clock offset</div>
      <label class="input w-full flex items-center gap-2">
        Hours: <input
          max="23"
          min="-23"
          type="number"
          class="grow text-right"
          placeholder="Hour"
          bind:value={$tcOffsets.hours}
        /></label
      >
      <label class="input w-full flex items-center gap-2">
        Minutes: <input
          max="59"
          min="-59"
          type="number"
          class="grow text-right"
          placeholder="Minute"
          bind:value={$tcOffsets.minutes}
        /></label
      >
      <label class="input w-full flex items-center gap-2">
        Seconds: <input
          max="59"
          min="-59"
          type="number"
          class="grow text-right"
          placeholder="Second"
          bind:value={$tcOffsets.seconds}
        /></label
      >
      <label class="input w-full flex items-center gap-2">
        Frames: <input
          max="24"
          min="-24"
          type="number"
          class="grow text-right"
          placeholder="Frame"
          bind:value={$tcOffsets.frames}
        /></label
      >
    {:else}
      <div class="divider my-0"></div>
      <div class="font-semibold">Local LTC input</div>
      <select
        class="select select-bordered w-full"
        value={$timecodeSource.ltcDeviceId || ""}
        onchange={(event) => selectDevice(event.currentTarget.value)}
      >
        <option value="">Default audio input</option>
        {#each $localLtcState.devices as device}
          <option value={device.deviceId}
            >{device.label || "Audio input"}</option
          >
        {/each}
      </select>
      <button
        class="btn btn-primary w-full"
        onclick={() => connectLocalLtc($timecodeSource.ltcDeviceId)}
        >Connect / Reconnect</button
      >
      {#if $localLtcState.status !== "idle" && $localLtcState.status !== "permission-needed"}
        <div class="flex items-center gap-2">
          <span class="text-xs opacity-60 shrink-0">Level</span>
          <div class="flex-1 h-2 rounded-full bg-base-300 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-75 {$localLtcState.level > 0.8 ? 'bg-error' : $localLtcState.level > 0.4 ? 'bg-success' : 'bg-success opacity-60'}"
              style="width: {$localLtcState.level * 100}%"
            ></div>
          </div>
        </div>
      {/if}
      <div class="text-sm">
        Status: <span class="font-semibold">{$localLtcState.status}</span>
        {#if $localLtcState.deviceLabel}
          <span>({$localLtcState.deviceLabel})</span>
        {/if}
      </div>
      <div class="font-mono text-lg">{$localLtcState.timecodeString}</div>
      {#if $localLtcState.error}
        <div class="alert alert-warning text-sm">{$localLtcState.error}</div>
      {/if}
      <p class="text-xs opacity-70">
        Browser audio input requires user permission. LTC date is not carried in
        the signal; weblogger uses the browser/project day for the log date.
      </p>
    {/if}
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
