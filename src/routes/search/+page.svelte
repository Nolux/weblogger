<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  import { DatePicker } from "@svelte-plugins/datepicker";
  import Icon from "@iconify/svelte";
  import dayjs from "dayjs";

  import SearchBadge from "$lib/components/viewer/SearchBadge.svelte";

  export let data;

  let searchInput = $page.url.searchParams.get("query") || "";

  $: logs = data.logs || [];
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
  let firstSearchDone = false;

  let dateSelectorOpen = false;
  let isOpen = false;
  const toggleDatePicker = () => (isOpen = !isOpen);

  const getNewData = async () => {
    console.log("called");
    loading = true;
    $page.url.searchParams.set("query", searchInput);
    $page.url.searchParams.set("filters", filters.join(" "));

    goto(`?${$page.url.searchParams.toString()}`);

    const res = await fetch(
      `/api/log/search?query=${searchInput}&page=${currentPage}&perPage=${perPage}&filters=${filters.join(",")}&asc=${asc ? "asc" : "desc"}${dateSelectorOpen ? "&localDate=" + selectedDate : ""}`
    );
    const data = await res.json();

    logs = data.logs;
    pages = data.page;

    loading = false;
    firstSearchDone = true;
  };
</script>

<div class="flex flex-col gap-8">
  <h1 class="text-3xl font-bold text-center hidden lg:block lg:text-left">
    Search
  </h1>
  <div class="flex flex-col gap-4 w-full justify-between">
    <div class="flex gap-4 items-stretch">
      <form
        class="grow grid gap-4"
        on:submit|preventDefault={() => {
          currentPage = 0;
          pages = { page: 0, totalPages: 0, totalCount: 0 };
          getNewData();
        }}
      >
        <label class="input input-bordered flex items-center gap-2">
          <Icon icon="mdi-search"></Icon>
          <input
            class="grow"
            type="text"
            bind:value={searchInput}
            placeholder="Search"
          />
        </label>

        <button class="btn btn-primary w-full" type="submit">Search</button>
      </form>
      <div class=" {dateSelectorOpen ? 'w-1/3' : ''}">
        {#if dateSelectorOpen}
          <div class="flex gap-2 justify-center h-full">
            <DatePicker
              enableFutureDates={false}
              showYearControls={true}
              align="right"
              onDayClick={(e) => {
                selectedDate = dayjs(e.startDate).format("YYYY.MM.DD");
                currentPage = 0;
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
            <button
              class="btn btn-error h-full"
              on:click={() => {
                dateSelectorOpen = false;
                selectedDate = null;
                currentPage = 0;
                getNewData();
              }}>close</button
            >
          </div>
        {:else}
          <button
            class="btn btn-warning h-full"
            on:click={() => {
              dateSelectorOpen = true;
              console.log(selectedDate);
            }}><Icon icon="mdi-date-range"></Icon></button
          >
        {/if}
      </div>
    </div>

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
            currentPage = 0;
            getNewData();
          }}
        >
          X
        </div>
      {/if}
      <SearchBadge
        callback={(filter) => {
          let newFilters = filters;
          if (!filters.includes(filter)) {
            newFilters.push(filter);
            filters = newFilters;
          }
          currentPage = 0;
          getNewData();
        }}
      />
    </div>
    <div class="grow p-2 flex flex-col gap-4">
      {#if loading}
        <div class="flex flex-col lg:flex-row gap-2 border border-accent p-2">
          <div class="w-full text-xl text-center">
            <span class="loading loading-spinner loading-md"></span>
          </div>
        </div>
      {:else if searchInput == ""}
        <div class="flex flex-col"></div>
      {:else}
        {#if logs.length < 1 && searchInput && firstSearchDone}
          <div class="flex flex-col lg:flex-row gap-2 border border-accent p-2">
            <div class="w-full text-xl text-center">No logs found</div>
          </div>
        {/if}
        {#each logs as log}
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
                          currentPage = 0;
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
                  Date:
                  <span class="font-bold">
                    {log.localDateString}
                  </span>
                </div>
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
        {#if pages}
          {#each { length: pages.totalPages } as _, i}<button
              class="{pages.totalPages > 1
                ? 'join-item'
                : ''} btn {currentPage == i ? 'btn-active' : ''}"
              on:click={() => {
                currentPage = i;
                getNewData();
              }}>{i + 1}</button
            >{/each}
        {/if}
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
