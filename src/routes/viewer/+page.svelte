<script>
  import { recentLogs } from "$lib/fake.js";
  let selectedDate = 2;
  const dates = [
    "2024.01.01",
    "2024.01.02",
    "2024.01.03",
    "2024.01.04",
    "2024.01.05",
  ];
</script>

<div class="h-screen flex flex-col gap-8">
  <h1 class="text-3xl text-bold text-center hidden lg:block lg:text-left">
    Viewer
  </h1>
  <div class="flex flex-col gap-4 w-full justify-between">
    <div class="text-2xl w-full flex">
      {#each dates as date, i}
        {#if i == selectedDate + 1 || i == selectedDate - 1 || i == selectedDate}
          <div
            on:click={() => {
              selectedDate = i;
            }}
            class="{i === selectedDate ? 'text-5xl' : ''} grow text-center"
          >
            {date}
          </div>
        {/if}
      {/each}
    </div>
    <div class="grow p-2 flex flex-col gap-4">
      {#each recentLogs as log}
        <div class="flex flex-col lg:flex-row gap-2 border rounded p-2">
          <div class="w-full text-xl">
            {log.body}
          </div>
          <div class="divider divider-horizontal w-2"></div>
          <div class="flex justify-between flex-row lg:flex-col gap-2 lg:w-40">
            <div class="text-xl">
              Timecode:
              <span class="font-bold">
                {log.timecode.hours
                  .toString()
                  .padStart(2, "0")}:{log.timecode.minutes
                  .toString()
                  .padStart(2, "0")}:{log.timecode.seconds
                  .toString()
                  .padStart(2, "0")}:{log.timecode.frames
                  .toString()
                  .padStart(2, "0")}
              </span>
            </div>
            <div>Created by: {log.createdByFullName}</div>
          </div>
        </div>
      {/each}
    </div>
    <div class="flex justify-around">
      <div class="join">
        <button class="join-item btn">1</button>
        <button class="join-item btn btn-active">2</button>
        <button class="join-item btn">3</button>
        <button class="join-item btn">4</button>
      </div>
    </div>
  </div>
</div>
