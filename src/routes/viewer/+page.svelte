<script>
  import Icon from "@iconify/svelte";

  export let data;

  $: logs = data.logs;
  $: page = data.page;
  $: user = data.user;
  $: projectDays = data.projectDays;
  $: selectedDate = data.selectedDate;
  $: perPage = data.perPage;

  $: console.log(data);

  let currentPage = 0;
  $: filters = [];

  const getNewData = async () => {
    const res = await fetch(
      `/api/log?page=${currentPage}&perPage=${perPage}&localDate=${projectDays[selectedDate]}&filters=${filters.join(",")}`
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
  <div class="flex justify-end gap-2">
    {#each filters as filter}
      <div
        class="badge {filter.includes(':')
          ? 'badge-primary'
          : 'badge-secondary'}"
      >
        {filter}
      </div>
    {/each}
    {#if filters.length > 0}
      <div
        class="badge badge-warning hover:brightness-50 cursor-pointer"
        on:click={() => {
          filters = [];
          getNewData();
        }}
      >
        X
      </div>
    {/if}
  </div>
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
      {#if logs.length < 1}
        <div class="flex flex-col lg:flex-row gap-2 border border-accent p-2">
          <div class="w-full text-xl text-center">No logs for date</div>
        </div>
      {:else}
        {#each logs as log}
          <div class="flex flex-col lg:flex-row gap-2 border border-accent p-2">
            <div class="w-full text-xl">
              {log.body}
            </div>
            <div class="divider divider-horizontal w-2"></div>
            <div class="w-20 mt-1 text-center">
              {#if log.tags.length > 0}
                {#each log.tags as tag}
                  <div
                    on:click={() => {
                      let newFilters = filters;
                      if (!filters.includes(tag)) {
                        console.log(tag);
                        newFilters.push(tag);
                        filters = newFilters;
                      } else {
                        filters = newFilters.filter((x) => x != tag);
                      }
                      getNewData();
                    }}
                    class="badge {filters.includes(tag)
                      ? 'badge-ghost'
                      : ''} {tag.includes(':')
                      ? 'badge-primary'
                      : 'badge-secondary'} hover:brightness-50 cursor-pointer mb-2"
                  >
                    {tag}
                  </div>
                {/each}
              {:else}
                <div class="badge badge-ghost">n/a</div>
              {/if}
            </div>
            <div class="divider divider-horizontal w-2"></div>
            <div
              class="flex justify-between flex-row lg:flex-col gap-2 lg:w-40"
            >
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
              <div class="text-xs">
                Created by: <span class="font-bold"
                  >{log.createdByFullName}</span
                >
              </div>
            </div>
            <div class="divider divider-horizontal w-2"></div>
            <div class="flex gap-2 flex-col w-12">
              <button class="btn"> <Icon icon="mdi:pencil"></Icon></button>
              <button
                class="btn {log.confirmDelete ? 'btn-error' : ''}"
                on:click={async () => {
                  if (!log.confirmDelete) {
                    log.confirmDelete = true;
                    setTimeout(() => {
                      log.confirmDelete = false;
                    }, 4000);
                  } else {
                    await fetch("/api/log/delete", {
                      method: "DELETE",
                      body: JSON.stringify({ logId: log.id }),
                    });
                    getNewData();
                  }
                }}><Icon icon="mdi:trash"></Icon></button
              >
            </div>
          </div>
        {/each}
      {/if}
    </div>

    <div class="flex justify-around">
      <div class="join">
        {#each { length: page.totalPages } as _, i}<button
            class="{page.totalPages > 1 ? 'join-item' : ''} btn {currentPage ==
            i
              ? 'btn-active'
              : ''}"
            on:click={() => {
              currentPage = i;
              getNewData();
            }}>{i + 1}</button
          >{/each}
      </div>
    </div>
  </div>
</div>
