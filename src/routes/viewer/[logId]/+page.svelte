<script>
  import Icon from "@iconify/svelte";
  import dayjs from "dayjs";
  import { DatePicker } from "@svelte-plugins/datepicker";
  import { page } from "$app/stores";

  export let data;

  $: log = data.log;

  let editMode = $page.url.searchParams.get("editmode") || false;

  let isOpen = false;
  let dateInput = "";

  const updateLog = async () => {
    const data = await fetch("/api/log", {
      method: "PATCH",
      body: JSON.stringify({
        id: log.id,
        updatedLog: {
          body: log.body,
          timecode: log.timecode,
          localDate: log.localDate,
        },
      }),
    });
    const returnedLog = await data.json();
    log = returnedLog;
    editMode = false;
  };

  function enforceMinMax(el, type) {
    const value = parseInt(el.target.value);

    if (value === null || isNaN(value)) {
      log.timecode[type] = 0;
      el.target.value = parseInt(0);
      return;
    }

    if (value < parseInt(el.target.min)) {
      log.timecode[type] = parseInt(el.target.min);
      el.target.value = parseInt(el.target.min);
      return;
    }
    if (value > parseInt(el.target.max)) {
      log.timecode[type] = parseInt(el.target.max);
      el.target.value = parseInt(el.target.max);
      return;
    }
    log.timecode[type] = value;
    el.target.value = value;
  }
</script>

<h1
  class="text-3xl font-bold font-bold text-center hidden lg:block lg:text-left mb-4"
>
  Viewer
</h1>
<div class="flex justify-between">
  <button
    class="btn btn-lg btn-ghost mb-4"
    on:click={() => window.history.back()}
    ><Icon icon="mdi:arrow-back" /></button
  >
  <div>
    <button
      class="btn {editMode ? 'btn-warning' : ''}"
      on:click={() => {
        if (editMode) {
          updateLog();
        } else {
          editMode = true;
        }
      }}><Icon icon="mdi:pencil" /></button
    >
    <button
      class="btn transition-all {log.confirmDelete ? 'btn-error' : ''}"
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
          window.history.back();
        }
      }}
      ><Icon icon="mdi:trash"></Icon>{log.confirmDelete
        ? "Are you sure?"
        : ""}</button
    >
  </div>
</div>
{#if log}
  {#if !editMode}
    <div class="grid grid-cols-4 gap-8 border border-accent rounded p-2">
      <div class="col-span-3">{log.body}</div>
      <div class="col-span-1 flex flex-col justify-start gap-2">
        <div>Created {dayjs(log.createdAt).format("YYYY.MM.DD HH:MM")}</div>
        <div>by {log.createdByFullName}</div>
        <div>{log.localDateString}</div>
        <div>{log.timecodeString}</div>
        <div class="w-20 mt-1 text-center">
          {#if log.tags?.length > 0}
            {#each log.tags as tag}
              <div
                class="badge w-full {tag.includes(':')
                  ? `bg-${log.markerColor}`
                  : 'badge-accent'} hover:brightness-50 cursor-pointer mb-2"
              >
                <span
                  class={tag.includes(":")
                    ? `text-${log.markerTextColor} font-bold`
                    : ""}>{tag}</span
                >
              </div>
            {/each}
          {:else}
            <div class="badge badge-ghost">n/a</div>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <div class="grid grid-cols-4 gap-8 border border-accent rounded p-2">
      <div class="col-span-4 flex flex-col gap-2">
        Body:
        <textarea
          class="textarea textarea-bordered"
          type="textarea"
          rows="4"
          bind:value={log.body}
        />
      </div>

      <div class="col-span-2 flex flex-col gap-2">
        Timecode:
        <label class="flex items-center gap-4 justify-between">
          Hours:
          <input
            class="input input-bordered"
            type="number"
            min="0"
            max="23"
            bind:value={log.timecode.hours}
            on:keyup={(e) => enforceMinMax(e, "hours")}
          />
        </label>
        <label class="flex items-center gap-4 justify-between">
          Minutes:
          <input
            class="input input-bordered"
            type="number"
            min="0"
            max="59"
            bind:value={log.timecode.minutes}
            on:keyup={(e) => enforceMinMax(e, "minutes")}
          />
        </label>
        <label class="flex items-center gap-4 justify-between">
          Seconds:
          <input
            class="input input-bordered"
            type="number"
            min="0"
            max="59"
            bind:value={log.timecode.seconds}
            on:keyup={(e) => enforceMinMax(e, "seconds")}
          />
        </label>
        <label class="flex items-center gap-4 justify-between">
          Frames:
          <input
            class="input input-bordered"
            type="number"
            min="0"
            max="24"
            bind:value={log.timecode.frames}
            on:keyup={(e) => enforceMinMax(e, "frames")}
          />
        </label>
      </div>
      <div class="col-span-2 flex flex-col gap-2">
        Date:
        <DatePicker
          enableFutureDates={false}
          showYearControls={true}
          align="right"
          onDayClick={(e) => {
            const date = dayjs(e.startDate);
            log.localDateString = date.format("YYYY.MM.DD");
            log.localDate = {
              year: date.year(),
              month: date.month() + 1,
              day: date.date(),
            };
          }}
          theme="postlogger-datepicker"
          bind:isOpen
          ><div class="tooltip tooltip-secondary w-full" data-tip="Select Date">
            <input
              class="input input-bordered w-full input-lg text-center xl:text-3xl text-2xl font-bold select-none tooltip lg:tooltip-left"
              type="text"
              placeholder="Select date"
              on:click={() => {
                isOpen = !isOpen;
              }}
              bind:value={log.localDateString}
            />
          </div>
        </DatePicker>
      </div>
      <div class="col-span-4 flex gap-2">
        <button
          class="btn btn-primary w-full"
          on:click={() => {
            updateLog();
          }}>Save</button
        >
      </div>
    </div>{/if}
{/if}

<style>
  :global(.datepicker) {
    width: 100%;
  }
  :global(.datepicker[data-picker-theme="postlogger-datepicker"]) {
    --datepicker-container-background: oklch(var(--b1));
    --datepicker-container-border: 1px solid oklch(var(--s));

    --datepicker-calendar-header-text-color: oklch(var(--bc));
    --datepicker-calendar-dow-color: oklch(var(--bc));
    --datepicker-calendar-day-color: oklch(var(--s));
    --datepicker-calendar-day-color-disabled: oklch(var(--nc));
    --datepicker-calendar-range-selected-background: oklch(var(--s));

    --datepicker-calendar-header-month-nav-background-hover: oklch(var(--s));
    --datepicker-calendar-header-month-nav-icon-next-filter: oklch(var(--nc));
    --datepicker-calendar-header-month-nav-icon-prev-filter: oklch(var(--nc));
    --datepicker-calendar-header-year-nav-icon-next-filter: oklch(var(--nc));
    --datepicker-calendar-header-year-nav-icon-prev-filter: oklch(var(--nc));

    --datepicker-calendar-split-border: 1px solid pink;

    --datepicker-presets-border: 1px solid pink;
    --datepicker-presets-button-background-active: #ff1683;
    --datepicker-presets-button-color: oklch(var(--s));
    --datepicker-presets-button-color-active: oklch(var(--s));
    --datepicker-presets-button-color-hover: #333;
    --datepicker-presets-button-color-focus: #333;
  }
  :global(.datepicker .calendars-container.right) {
    margin-top: 1em;
    left: 35% !important;
    right: auto !important;
  }
</style>
