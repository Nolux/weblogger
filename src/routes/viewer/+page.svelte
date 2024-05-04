<script>
  import Icon from "@iconify/svelte";
  import { DatePicker } from "@svelte-plugins/datepicker";
  import dayjs from "dayjs";

  export let data;

  $: logs = data.logs;
  $: page = data.page;
  $: user = data.user;
  $: projectDays = data.projectDays;
  $: selectedDate = data.selectedDate;
  $: perPage = data.perPage;
  let asc = true;

  $: console.log(data);

  let currentPage = 0;
  $: filters = [];

  const getNewData = async () => {
    const res = await fetch(
      `/api/log?page=${currentPage}&perPage=${perPage}&localDate=${selectedDate}&filters=${filters.join(",")}&asc=${asc ? "asc" : "desc"}`
    );
    const data = await res.json();
    logs = data.logs;
    page = data.page;
  };
  let isOpen = false;

  const toggleDatePicker = () => (isOpen = !isOpen);
</script>

<div class="flex flex-col gap-8">
  <h1 class="text-3xl font-bold text-center hidden lg:block lg:text-left">
    Viewer
  </h1>
  <div class="flex flex-col gap-4 w-full justify-between">
    <div class="grid grid-cols-4 gap-4 items-stretch">
      <div class="col-span-4 lg:col-span-2 self-stretch">
        <DatePicker
          enableFutureDates={false}
          showYearControls={true}
          align="right"
          onDayClick={(e) => {
            selectedDate = dayjs(e.startDate).format("YYYY.MM.DD");
            getNewData();
          }}
          theme="custom-datepicker"
          bind:isOpen
          enabledDates={projectDays}
          ><div
            class="tooltip tooltip-accent w-full h-full"
            data-tip="Select Date"
          >
            <input
              class="h-full input input-accent w-full text-4xl input-lg text-center"
              type="text"
              placeholder="Select date"
              on:click={toggleDatePicker}
              on:change={() => {
                console.log("object");
              }}
              bind:value={selectedDate}
            />
          </div>
        </DatePicker>
      </div>
      <div
        class="flex justify-between items-center col-span-4 lg:col-span-2 border border-accent p-4 gap-4 text-center"
      >
        <div class="tooltip" data-tip="Oldest first">
          <input
            type="checkbox"
            class="toggle"
            bind:checked={asc}
            on:change={() => {
              getNewData();
            }}
          />
        </div>
        <a
          class="m-1 btn btn-lg aspect-square"
          target="_blank"
          href="/api/exports/pdf?localDate={selectedDate}"
          ><Icon icon="mdi:printer"></Icon></a
        >
        <details class="dropdown">
          <summary class="m-1 btn btn-lg">Exports</summary>
          <ul
            class="p-2 shadow menu bg-base-300 dropdown-content w-44 z-[1] rounded-box join join-vertical"
          >
            <a
              class="btn join-item"
              target="_blank"
              href="/api/exports/avid?localDate={selectedDate}"
              >AVID Markers TXT</a
            >
            <a
              class="btn join-item"
              target="_blank"
              href="/api/exports/ppro?localDate={selectedDate}"
              >Premiere Pro XML</a
            >
            <a class="btn join-item" disabled>Final Cut X XML</a>
            <a
              class="btn join-item"
              target="_blank"
              href="/api/exports/csv?localDate={selectedDate}">CSV</a
            >
          </ul>
        </details>
      </div>
    </div>
    <div class="flex justify-end h-4 gap-2">
      {#each filters as filter}
        <div
          class="badge {filter.includes(':')
            ? `badge-green`
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
    <div class="grow p-2 flex flex-col gap-4">
      {#if logs.length < 1}
        <div class="flex flex-col lg:flex-row gap-2 border border-accent p-2">
          <div class="w-full text-xl text-center">No logs for date</div>
        </div>
      {:else}
        {#each logs as log}
          <div
            class="grid grid-cols-12 lg:flex-row gap-2 border border-accent p-2"
          >
            <div class="w-full text-xl col-span-12 lg:col-span-8">
              {log.body}
            </div>
            <div
              class="flex col-span-12 lg:col-span-4 items-center justify-center lg:justify-end"
            >
              <div
                class="divider divider-horizontal w-2 visible lg:invisible"
              ></div>
              <div class="w-20 mt-1 text-center">
                {#if log.tags.length > 0}
                  {#each log.tags as tag}
                    <div
                      class="tooltip tooltip-left w-full"
                      data-tip="Click to apply filter"
                    >
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
                          ? `bg-${log.markerColor}`
                          : 'badge-accent'} hover:brightness-50 cursor-pointer mb-2"
                      >
                        <span
                          class={tag.includes(":")
                            ? "mix-blend-difference font-bold"
                            : ""}>{tag}</span
                        >
                      </div>
                    </div>
                  {/each}
                {:else}
                  <div class="badge badge-ghost">n/a</div>
                {/if}
              </div>
              <div
                class="divider divider-horizontal w-2 visible lg:invisible"
              ></div>
              <div class="flex justify-between flex-col gap-2 lg:w-40">
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
              <div
                class="divider divider-horizontal w-2 visible lg:invisible"
              ></div>
              <div class="flex gap-2 flex-col w-12">
                <a class="btn" href={`/viewer/${log.id}/`}>
                  <Icon icon="mdi:pencil"></Icon></a
                >
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

<style>
  :global(.datepicker) {
    width: 100%;
  }
  :global(.datepicker[data-picker-theme="custom-datepicker"]) {
    height: 100%;
    --datepicker-container-background: oklch(var(--b1));
    --datepicker-container-border: 1px solid oklch(var(--a));

    --datepicker-calendar-header-text-color: oklch(var(--bc));
    --datepicker-calendar-dow-color: oklch(var(--bc));
    --datepicker-calendar-day-color: oklch(var(--a));
    --datepicker-calendar-day-color-disabled: oklch(var(--nc));
    --datepicker-calendar-range-selected-background: oklch(var(--a));

    --datepicker-calendar-header-month-nav-background-hover: oklch(var(--a));
    --datepicker-calendar-header-month-nav-icon-next-filter: oklch(var(--nc));
    --datepicker-calendar-header-month-nav-icon-prev-filter: oklch(var(--nc));
    --datepicker-calendar-header-year-nav-icon-next-filter: oklch(var(--nc));
    --datepicker-calendar-header-year-nav-icon-prev-filter: oklch(var(--nc));

    --datepicker-calendar-split-border: 1px solid pink;

    --datepicker-presets-border: 1px solid pink;
    --datepicker-presets-button-background-active: #ff1683;
    --datepicker-presets-button-color: oklch(var(--a));
    --datepicker-presets-button-color-active: oklch(var(--a));
    --datepicker-presets-button-color-hover: #333;
    --datepicker-presets-button-color-focus: #333;
  }
  :global(.datepicker .calendars-container.right) {
    margin-top: 1em;
    left: 35% !important;
    right: auto !important;
  }
</style>
