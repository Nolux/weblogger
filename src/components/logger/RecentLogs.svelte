<script>
  import { recentLogsStore } from "$lib/store/recentLogs";
  import { deleteLog, updateLog } from "$lib/classes/Log.js";

  const displayAsDobbleDigit = (digit) => {
    return digit < 10 ? "0" + digit : digit;
  };

  $: console.log($recentLogsStore);
</script>

<div>
  <h2 class="pb-4">Recent Logs:</h2>
  {#each $recentLogsStore as log}
    <div class="flex items-center pb-4">
      {#if !log.editmode}
        <div class="flex-1">{log.body}</div>
        <div class="flex-none px-2">
          {displayAsDobbleDigit(log.timecode.hours)}:{displayAsDobbleDigit(
            log.timecode.minutes
          )}:{displayAsDobbleDigit(log.timecode.seconds)}:{displayAsDobbleDigit(
            log.timecode.frames
          )}
        </div>
      {:else}
        <textarea class="textarea flex-1" bind:value={log.body} />

        <div class="flex-none px-2">
          <input
            class="input input-xs w-14"
            bind:value={log.timecode.hours}
            type="number"
            min="0"
            max="23"
            step="1"
          />
          :
          <input
            class="input input-xs w-14"
            bind:value={log.timecode.minutes}
            type="number"
            min="0"
            max="59"
            step="1"
          />
          :
          <input
            class="input input-xs w-14"
            bind:value={log.timecode.seconds}
            type="number"
            min="0"
            max="59"
            step="1"
          />
          :
          <input
            class="input input-xs w-14"
            bind:value={log.timecode.frames}
            type="number"
            min="0"
            max="99"
            step="1"
          />
        </div>
      {/if}
      <div class="flex-none justify-center px-2">
        <button
          class="btn btn-xs {log.confirm ? 'btn-error' : 'btn-ghost'}"
          on:click={() => {
            // should be a check?
            if (log.confirm) {
              deleteLog(log.id, () => {});
            } else {
              log.confirm = true;
              setTimeout(() => {
                log.confirm = false;
              }, 10000);
            }
          }}>del</button
        >
        <button
          class="btn btn-xs btn-ghost"
          on:click={() => {
            if (log.editmode) {
              log.editmode = false;
              updateLog(log, () => {});
            } else {
              log.editmode = true;
            }
          }}>edit</button
        >
      </div>
    </div>
    <div class="divider" />
  {/each}
</div>

<style>
  .bodycell {
  }
  table {
    width: 100%;
  }
</style>
