<script>
  export let data;

  $: logs = data.logs;
  $: page = data.page;
  $: user = data.user;
  $: projectDays = data.projectDays;
  $: selectedDate = data.selectedDate;
  $: perPage = data.perPage;

  let currentPage = 0;

  const getNewData = async () => {
    const res = await fetch(
      `/api/log?page=${currentPage}&perPage=${perPage}&localDate=${projectDays[selectedDate]}`
    );
    const data = await res.json();
    logs = data.logs;
    page = data.page;
  };
</script>

<div class="h-screen flex flex-col gap-8">
  <h1 class="text-3xl text-bold text-center hidden lg:block lg:text-left">
    Viewer
  </h1>
  <div class="flex flex-col gap-4 w-full justify-between">
    <div class="text-2xl w-full flex">
      {#each projectDays as date, i}
        {#if i == selectedDate + 1 || i == selectedDate - 1 || i == selectedDate}
          <div
            on:click={() => {
              selectedDate = i;
              currentPage = 0;
              getNewData();
            }}
            class="{i === selectedDate ? 'text-5xl' : ''} grow text-center"
          >
            {date}
          </div>
        {/if}
      {/each}
    </div>
    <div class="grow p-2 flex flex-col gap-4">
      {#each logs as log}
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
        {#each { length: page.totalPages } as _, i}<button
            class="join-item btn {currentPage == i ? 'btn-active' : ''}"
            on:click={() => {
              currentPage = i;
              getNewData();
            }}>{i + 1}</button
          >{/each}
      </div>
    </div>
  </div>
</div>
