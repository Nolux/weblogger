<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  import Icon from "@iconify/svelte";
  import { DatePicker } from "@svelte-plugins/datepicker";
  import dayjs from "dayjs";

  import SearchBadge from "$lib/components/viewer/SearchBadge.svelte";

  export let data;

  $: logs = data.logs;
  $: pages = data.page;
  $: user = data.user;
  $: projectDays = data.projectDays;
  $: selectedDate = data.selectedDate;
  $: perPage = data.perPage;
  let asc = true;

  let currentPage = 0;
  let filters = $page.url.searchParams.get("filters") || [];
  if (filters != "") {
    filters = filters.split(" ");
  }
  let filterColors = [];

  let loading = false;

  let showTimecodePicker = false;
  let inputTimecode = { hours: 0, minutes: 0, seconds: 0, frames: 0 };

  let excludeMode = $page.url.searchParams.get("excludeMode") || false

  const getNewData = async () => {
    loading = true;
    $page.url.searchParams.set("selectedDate", selectedDate);
    $page.url.searchParams.set("filters", filters);
    goto(`?${$page.url.searchParams.toString()}`);
    const res = await fetch(
      `/api/log?page=${currentPage}&perPage=${perPage}&localDate=${selectedDate}&filters=${filters.join(",")}&asc=${asc ? "asc" : "desc"}${
        showTimecodePicker
          ? `&afterTc=${inputTimecode.hours
              .toString()
              .padStart(2, "0")}:${inputTimecode.minutes
              .toString()
              .padStart(2, "0")}:${inputTimecode.seconds
              .toString()
              .padStart(2, "0")}:${inputTimecode.frames
              .toString()
              .padStart(2, "0")}`
          : ""
      }`
    );
    const data = await res.json();
    logs = data.logs;
    pages = data.page;

    if (currentPage > pages.totalPages) {
      currentPage = 0;
      getNewData();
    }

    loading = false;
  };

  let isOpen = false;

  const toggleDatePicker = () => (isOpen = !isOpen);

  function enforceMinMax(el, type) {
    const value = parseInt(el.target.value);

    if (value === null || isNaN(value)) {
      inputTimecode[type] = 0;
      el.target.value = parseInt(0);
      return;
    }

    if (value < parseInt(el.target.min)) {
      inputTimecode[type] = parseInt(el.target.min);
      el.target.value = parseInt(el.target.min);
      return;
    }
    if (value > parseInt(el.target.max)) {
      inputTimecode[type] = parseInt(el.target.max);
      el.target.value = parseInt(el.target.max);
      return;
    }
    inputTimecode[type] = value;
    el.target.value = value;
  }
</script>

<div class="flex flex-col gap-8">
  <h1 class="text-3xl font-bold text-center hidden lg:block lg:text-left">
    Viewer
  </h1>
  <div class="flex flex-col gap-4 w-full justify-between">
    <div class="grid grid-cols-4 gap-4 items-stretch">
      <div class="col-span-4 lg:col-span-3 self-stretch">
        <DatePicker
          enableFutureDates={false}
          showYearControls={true}
          align="right"
          onDayClick={(e) => {
            selectedDate = dayjs(e.startDate).format("YYYY.MM.DD");
            console.log(e);
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
              bind:value={selectedDate}
            />
          </div>
        </DatePicker>
      </div>
      <div
        class="flex justify-center col-span-4 lg:col-span-1 border border-accent p-4 gap-4 text-center"
      >
        <button
          class="btn tooltip {showTimecodePicker ? 'btn-warning' : ''}"
          data-tip="Filter by start time"
          on:click={() => {
            showTimecodePicker = !showTimecodePicker;
            if (!showTimecodePicker) {
              getNewData();
            }
          }}><Icon icon="mdi:clock-edit-outline"></Icon></button
        >

        <details class="dropdown tooltip dropdown-left" data-tip="Menu">
          <summary class="btn"><Icon icon="mdi:hamburger-menu"></Icon></summary>
          <ul
            class="p-2 gap-2 shadow menu bg-base-300 dropdown-content w-60 z-[1] rounded-box join join-vertical"
          >
            <div class="divider">
              <span>Exclude Search Tags</span>
            </div>
            <div class="w-full flex justify-center items-center mb-4">
            <input type="checkbox" class="toggle {excludeMode ? "toggle-warning": ""}" bind:checked={excludeMode} on:click={() => {
               console.log("object");
               excludeMode =!excludeMode;
               $page.url.searchParams.set("excludeMode", excludeMode);
               goto(`?${$page.url.searchParams.toString()}`);
            }} />
            </div>
            <div class="divider">
              <span
                class={showTimecodePicker || filters.length > 0
                  ? "text-warning"
                  : ""}
                >{showTimecodePicker || filters.length > 0
                  ? "Print with filters"
                  : "Print"}</span
              >
            </div>

            <a
              class="btn btn-xs"
              target="_blank"
              href={`/api/exports/pdf?localDate=${selectedDate}&filters=${filters.join(",")}${
                showTimecodePicker
                  ? `&afterTc=${inputTimecode.hours
                      .toString()
                      .padStart(2, "0")}:${inputTimecode.minutes
                      .toString()
                      .padStart(2, "0")}:${inputTimecode.seconds
                      .toString()
                      .padStart(2, "0")}:${inputTimecode.frames
                      .toString()
                      .padStart(2, "0")}`
                  : ""
              }&excludeFilter=${excludeMode}`}><Icon icon="mdi:printer"></Icon>PDF</a
            >
            <a
              class="btn btn-xs"
              target="_blank"
              href={`/api/exports/text?localDate=${selectedDate}&filters=${filters.join(",")}${
                showTimecodePicker
                  ? `&afterTc=${inputTimecode.hours
                      .toString()
                      .padStart(2, "0")}:${inputTimecode.minutes
                      .toString()
                      .padStart(2, "0")}:${inputTimecode.seconds
                      .toString()
                      .padStart(2, "0")}:${inputTimecode.frames
                      .toString()
                      .padStart(2, "0")}`
                  : ""
              }&excludeFilter=${excludeMode}`}><Icon icon="mdi:file-text"></Icon>Text file</a
            >
            <div class="divider py-4 pt-8">
              <span
                class={showTimecodePicker || filters.length > 0
                  ? "text-warning"
                  : ""}
                >{showTimecodePicker || filters.length > 0
                  ? "Exports with filters"
                  : "Exports"}</span
              >
            </div>
            <a
              class="btn btn-xs"
              target="_blank"
              href={`/api/exports/avid?localDate=${selectedDate}&filters=${filters.join(",")}${
                showTimecodePicker
                  ? `&afterTc=${inputTimecode.hours
                      .toString()
                      .padStart(2, "0")}:${inputTimecode.minutes
                      .toString()
                      .padStart(2, "0")}:${inputTimecode.seconds
                      .toString()
                      .padStart(2, "0")}:${inputTimecode.frames
                      .toString()
                      .padStart(2, "0")}`
                  : ""
              }&excludeFilter=${excludeMode}`}>AVID Markers TXT</a
            >
            <a
              class="btn btn-xs"
              target="_blank"
              href={`/api/exports/ppro?localDate=${selectedDate}&filters=${filters.join(",")}${
                showTimecodePicker
                  ? `&afterTc=${inputTimecode.hours
                      .toString()
                      .padStart(2, "0")}:${inputTimecode.minutes
                      .toString()
                      .padStart(2, "0")}:${inputTimecode.seconds
                      .toString()
                      .padStart(2, "0")}:${inputTimecode.frames
                      .toString()
                      .padStart(2, "0")}`
                  : ""
              }&excludeFilter=${excludeMode}`}>Premiere Pro XML</a
            >
            <a class="btn btn-xs" disabled>Final Cut X XML</a>
            <a
              class="btn btn-xs"
              target="_blank"
              href={`/api/exports/csv?localDate=${selectedDate}&filters=${filters.join(",")}${
                showTimecodePicker
                  ? `&afterTc=${inputTimecode.hours
                      .toString()
                      .padStart(2, "0")}:${inputTimecode.minutes
                      .toString()
                      .padStart(2, "0")}:${inputTimecode.seconds
                      .toString()
                      .padStart(2, "0")}:${inputTimecode.frames
                      .toString()
                      .padStart(2, "0")}`
                  : ""
              }&excludeFilter=${excludeMode}`}>CSV</a
            >

            <div class="divider py-4 pt-8">Import</div>

            <a
              class="btn btn-xs"
              target="_blank"
              href="/import?date={selectedDate}">Import</a
            >
          </ul>
        </details>
      </div>
    </div>
    {#if showTimecodePicker}
      <div
        class="w-full grid grid-cols-5 gap-4 text-center border border-accent p-4"
      >
        <div class="font-bold text-xl">Hours</div>
        <div class="font-bold text-xl">Minutes</div>
        <div class="font-bold text-xl">Seconds</div>
        <div class="font-bold text-xl">Frames</div>
        <div class="font-bold text-xl"></div>
        <input
          type="number"
          min="0"
          max="23"
          id="hours"
          class="input input-bordered"
          placeholder="Hours"
          on:keyup={(e) => enforceMinMax(e, "hours")}
          on:change={(e) => enforceMinMax(e, "hours")}
          value="0"
        />
        <input
          type="number"
          max="59"
          min="0"
          id="minutes"
          class="input input-bordered"
          placeholder="minutes"
          on:keyup={(e) => enforceMinMax(e, "minutes")}
          on:change={(e) => enforceMinMax(e, "minutes")}
          value="0"
        />
        <input
          type="number"
          max="59"
          min="0"
          id="seconds"
          class="input input-bordered"
          placeholder="seconds"
          on:keyup={(e) => enforceMinMax(e, "seconds")}
          on:change={(e) => enforceMinMax(e, "seconds")}
          value="0"
        />
        <input
          type="number"
          max="24"
          min="0"
          id="frames"
          class="input input-bordered"
          placeholder="frames"
          on:keyup={(e) => enforceMinMax(e, "frames")}
          on:change={(e) => enforceMinMax(e, "frames")}
          value="0"
        />
        <button class="btn btn-success" on:click={getNewData}>
          {#if loading}<span class="loading loading-spinner loading-lg"
            ></span>{:else}GO{/if}
        </button>
      </div>
    {/if}
    <div class="flex justify-end h-4 gap-2">
      {#each filters as filter}
        <div
          class={`badge ${
            filter.includes(":")
              ? `bg-${filterColors[filter]?.markerColor} font-bold`
              : "badge-accent"
          }`}
        >
          <span
            class={filter.includes(":")
              ? `text-${filterColors[filter]?.markerTextColor} font-bold`
              : ""}
          >
            {filter}</span
          >
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
          <Icon icon="mdi:close"></Icon>
        </div>
      {/if}
      <SearchBadge
        callback={(filter) => {
          let newFilters = filters;
          if (!filters.includes(filter)) {
            newFilters.push(filter);
            filters = newFilters;
          }
          getNewData();
        }}
      />
    </div>
    <div class="grow p-2 flex flex-col gap-4">
      {#if logs.length < 1}
        <div class="flex flex-col lg:flex-row gap-2 border border-accent p-2">
          <div class="w-full text-xl text-center">No logs for date</div>
        </div>
      {:else}
        {#each logs as log (log.id)}
          <div
            class="grid grid-cols-12 lg:flex-row gap-2 border {!log.deleted
              ? 'border-accent'
              : 'border-error'} p-2"
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
                            newFilters.push(tag);
                            filterColors[tag] = {
                              markerColor: log.markerColor,
                              markerTextColor: log.markerTextColor,
                            };
                            filters = newFilters;
                          } else {
                            filters = newFilters.filter((x) => x != tag);
                          }
                          getNewData();
                        }}
                        class="badge {filters.includes(tag)
                          ? 'badge-ghost'
                          : ''} {tag.includes(':')
                          ? `bg-${log.markerColor} `
                          : 'badge-accent'} hover:brightness-50 cursor-pointer mb-2"
                      >
                        <span
                          class={tag.includes(":")
                            ? `text-${log.markerTextColor} font-bold`
                            : ""}>{tag}</span
                        >
                      </div>
                    </div>
                  {/each}
                {:else}{/if}
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
                <a class="btn" href={`/viewer/${log.id}?editmode=true/`}>
                  <Icon icon="mdi:pencil"></Icon></a
                >
                {#if !log.deleted}
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
                  >{:else}
                  <button
                    class="btn {log.confirmRestore ? 'btn-success' : ''}"
                    on:click={async () => {
                      if (!log.confirmRestore) {
                        log.confirmRestore = true;
                        setTimeout(() => {
                          log.confirmRestore = false;
                        }, 4000);
                      } else {
                        await fetch("/api/log/restore", {
                          method: "POST",
                          body: JSON.stringify({ logId: log.id }),
                        });
                        getNewData();
                      }
                    }}><Icon icon="mdi:arrow-u-left-top"></Icon></button
                  >
                {/if}
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>

    <div class="flex justify-around">
      <div class="join">
        {#each { length: pages.totalPages } as _, i}<button
            class="{pages.totalPages > 1 ? 'join-item' : ''} btn {currentPage ==
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
