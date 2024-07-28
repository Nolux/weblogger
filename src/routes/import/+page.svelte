<script>
  import { DatePicker } from "@svelte-plugins/datepicker";
  import { enhance, applyAction } from "$app/forms";
  import dayjs from "dayjs";
  import { page } from "$app/stores";

  import { AlertsStore } from "$lib/stores/alertsStore.js";

  const authorizedExtensions = [".txt"];

  export let form;

  $: {
    if (form?.error) {
    }
    if (form?.logs) {
    }
  }
  let loading = false;

  let isOpen = false;
  let selectedDate = $page.url.searchParams.get("date") || "";

  const submitData = async () => {
    let logs = form.logs;
    logs = logs
      .map((log) => {
        if (!log.exclude) {
          return log;
        }
      })
      .filter(Boolean);

    const res = await fetch("/api/log/many", {
      method: "POST",
      body: JSON.stringify({ logs, localDateString: form.localDateString }),
    });
    const data = await res.json();
    if (data.count) {
      AlertsStore.addAlert(
        `Uploaded to server, ${data.count} logs added at ${form.localDateString}`,
        "success"
      );
      form = null;
    } else {
      AlertsStore.addAlert(`Error during upload`, "warning");
    }
  };
</script>

<div class="flex flex-col gap-8">
  <h1 class="text-3xl font-bold text-center hidden lg:block lg:text-left">
    Import
  </h1>
  {#if !form?.logs}
    <form
      use:enhance={() => {
        loading = true;
        return async ({ result, update }) => {
          await applyAction(result);
          loading = false;
          // `result` is an `ActionResult` object
          // `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
        };
      }}
      class="flex flex-col w-1/2 m-auto justify-between gap-6"
      action="?/uploadFile"
      method="POST"
      enctype="multipart/form-data"
      accept={authorizedExtensions.join(",")}
      required
    >
      <h2 class="text-xl font-bold">Upload file here.</h2>
      <label class="w-full flex justify-between items-center gap-4">
        <div class="w-1/2">Uploaded file:</div>
        <DatePicker
          enableFutureDates={false}
          showYearControls={true}
          align="center"
          onDayClick={(e) => {
            selectedDate = dayjs(e.startDate).format("YYYY.MM.DD");
          }}
          theme="custom-datepicker"
          bind:isOpen
          ><div
            class="tooltip tooltip-accent w-full h-full"
            data-tip="Select Date"
          >
            <input
              class="input input-accent w-full text-center"
              type="text"
              placeholder="Select date"
              name="localDate"
              id="localDate"
              on:click={() => {
                isOpen = !isOpen;
              }}
              bind:value={selectedDate}
            />
          </div>
        </DatePicker>
      </label>
      <label class="w-full flex justify-between items-center gap-4">
        <div class="w-1/2">Uploaded file:</div>
        <input
          type="file"
          class="file-input grow file-input-bordered file-input-accent"
          name="file"
          id="file"
        />
      </label>
      <label class="w-full flex justify-between items-center gap-4">
        <div class="w-1/2">File type:</div>
        <select class="select grow select-accent file-input-accent">
          <option value="avid">Avid Marker file</option>
        </select>
      </label>
      <button class="btn" type="submit"
        >{#if loading}<span class="loading loading-spinner loading-md"
          ></span>{:else}Upload{/if}</button
      >
    </form>
  {:else}
    <div class="flex flex-col justify-between gap-6">
      <div class="w-1/2 m-auto flex flex-col gap-4">
        <h2 class="text-xl font-bold">Confirm logs and add to server</h2>
        <div class="flex mb-4">
          This action is irreversible, and needs to be manually deleted if
          imported wrong. So make sure you know what you are doing.
        </div>
        <div class="flex gap-4">
          <button class="btn grow btn-primary" on:click={submitData}
            >Submit</button
          ><button
            class="btn grow btn-warning"
            on:click={() => {
              form.logs = null;
            }}>Reset</button
          >
        </div>
      </div>
      <table class="table table-striped">
        <thead>
          <tr class="text-center">
            <th>Timecode</th>
            <th class="">Body</th>
            <th>Color</th>
            <th>Markers</th>
            <th>Exclude from import</th>
          </tr>
        </thead>
        {#each form?.logs as log}
          <tr class="text-center">
            <td>{log.timecodeString}</td>
            <td class="">{log.body}</td>
            <td>{log.color}</td>
            <td>{log.marker}</td>
            <td
              ><input
                type="checkbox"
                class="checkbox checkbox-xs"
                bind:checked={log.exclude}
              /></td
            >
          </tr>
        {/each}
      </table>
    </div>
  {/if}
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
    flex-grow: 1;
    left: 35% !important;
    right: auto !important;
  }
  :global(.datepicker) {
    flex-grow: 1;
    width: 50%;
    padding-left: 0.6em;
  }
</style>
