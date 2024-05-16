<script>
  export let data;
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import { writable } from "svelte/store";
  import { DatePicker } from "@svelte-plugins/datepicker";

  import { socket } from "$lib/socket.js";
  import { submitHotkey, resetHotkey } from "$lib/stores/hotkeysStore.js";
  import { shortcut } from "$lib/components/hotkeys/shortcut.js";

  import Hotkeys from "$lib/components/hotkeys/Hotkeys.svelte";

  $: logs = data.logs;
  $: user = data.user;
  $: currentProject = data.currentProject;

  dayjs.extend(relativeTime);

  let input = {
    timecode: { hours: 0, minutes: 0, seconds: 0, frames: 0 },
    body: "",
    localDate: { year: 2024, month: 1, day: 1 },
  };

  let dateInput = dayjs().format("YYYY-MM-DD");

  let recentLogs = writable([]);

  let submittingLog = false;

  const submitLog = async () => {
    submittingLog = true;
    input.localDate = {
      year: parseInt(dateInput.split("-")[0]),
      month: parseInt(dateInput.split("-")[1]),
      day: parseInt(dateInput.split("-")[2]),
    };

    const returnedLog = await fetch("/api/log", {
      method: "POST",
      body: JSON.stringify(input),
    });
    socket.emit("newData", user.selectedProjectId);

    console.log(returnedLog);
    input.body = "";
    let newLogs = $recentLogs;
    newLogs.push(await returnedLog.json());
    recentLogs.set(newLogs);
    console.log($recentLogs);
    submittingLog = false;
  };

  let isOpen = false;

  const toggleDatePicker = () => (isOpen = !isOpen);

  function enforceMinMax(el, type) {
    const value = parseInt(el.target.value);

    if (value === null || isNaN(value)) {
      input.timecode[type] = 0;
      el.target.value = parseInt(0);
      return;
    }

    if (value < parseInt(el.target.min)) {
      input.timecode[type] = parseInt(el.target.min);
      el.target.value = parseInt(el.target.min);
      return;
    }
    if (value > parseInt(el.target.max)) {
      input.timecode[type] = parseInt(el.target.max);
      el.target.value = parseInt(el.target.max);
      return;
    }
    input.timecode[type] = value;
    el.target.value = value;
  }
</script>

<div class="flex flex-col gap-8">
  <h1 class="text-3xl font-bold text-center hidden lg:block lg:text-left">
    Post-Logger
  </h1>

  <div class="grid lg:grid-cols-4 w-full gap-4">
    <textarea
      bind:value={input.body}
      class="lg:col-span-2 grow text-xl textarea textarea-lg textarea-secondary p-2"
      placeholder="Logger"
      rows={8}
    ></textarea>
    <div
      class="border border-secondary p-4 lg:col-span-2 flex flex-col gap-4 text-center xl:text-3xl text-2xl font-bold select-none"
    >
      <div class="flex flex-col gap-2">
        <DatePicker
          enableFutureDates={false}
          showYearControls={true}
          align="right"
          onDayClick={(e) => {
            console.log(e);
            dateInput = dayjs(e.startDate).format("YYYY-MM-DD");
          }}
          theme="postlogger-datepicker"
          bind:isOpen
          ><div class="tooltip tooltip-secondary w-full" data-tip="Select Date">
            <input
              class="input input-ghost w-full input-lg text-center xl:text-3xl text-2xl font-bold select-none tooltip lg:tooltip-left"
              type="text"
              placeholder="Select date"
              on:click={toggleDatePicker}
              on:change={() => {
                console.log("object");
              }}
              bind:value={dateInput}
            />
          </div>
        </DatePicker>

        <div>
          TC: <span class="font-mono">
            {input.timecode.hours
              .toString()
              .padStart(2, "0")}:{input.timecode.minutes
              .toString()
              .padStart(2, "0")}:{input.timecode.seconds
              .toString()
              .padStart(2, "0")}:{input.timecode.frames
              .toString()
              .padStart(2, "0")}
          </span>
        </div>
        <div class="w-full grid grid-cols-4">
          <input
            type="number"
            min="0"
            max="23"
            id="hours"
            class="input"
            placeholder="Hours"
            on:keyup={(e) => enforceMinMax(e, "hours")}
            value="0"
          />
          <input
            type="number"
            max="59"
            min="0"
            id="minutes"
            class="input"
            placeholder="minutes"
            on:keyup={(e) => enforceMinMax(e, "minutes")}
            value="0"
          />
          <input
            type="number"
            max="59"
            min="0"
            id="seconds"
            class="input"
            placeholder="seconds"
            on:keyup={(e) => enforceMinMax(e, "seconds")}
            value="0"
          />
          <input
            type="number"
            max="24"
            min="0"
            id="frames"
            class="input"
            placeholder="frames"
            on:keyup={(e) => enforceMinMax(e, "frames")}
            value="0"
          />
        </div>
        <div class="divider"></div>
        <div class="flex gap-2">
          <button
            class="btn w-1/2"
            use:shortcut={{
              shift: $submitHotkey.modifiers.shift,
              control: $submitHotkey.modifiers.control,
              alt: $submitHotkey.modifiers.alt,
              code: $submitHotkey.key,
            }}
            on:click={() => {
              submitLog();
            }}
          >
            <div class="flex flex-col">
              {#if submittingLog}
                <span class="loading loading-spinner text-secondary loading-sm"
                ></span>
              {:else}
                <div>Submit</div>
                <div class="text-xs">
                  {$submitHotkey.modifiers.control ? "CTL + " : ""}
                  {$submitHotkey.modifiers.shift ? "SHIFT + " : ""}
                  {$submitHotkey.modifiers.alt ? "ALT + " : ""}
                  {$submitHotkey.key}
                </div>
              {/if}
            </div>
          </button>
          <button
            class="btn w-1/2"
            use:shortcut={{
              shift: $resetHotkey.modifiers.shift,
              control: $resetHotkey.modifiers.control,
              alt: $resetHotkey.modifiers.alt,
              code: $resetHotkey.key,
            }}
            on:click={() => {
              input.body = "";
            }}
          >
            <div class="flex flex-col">
              <div>Reset</div>
              <div class="text-xs">
                {$resetHotkey.modifiers.control ? "CTL + " : ""}
                {$resetHotkey.modifiers.shift ? "SHIFT + " : ""}
                {$resetHotkey.modifiers.alt ? "ALT + " : ""}
                {$resetHotkey.key}
              </div>
            </div></button
          >
        </div>
      </div>
    </div>
  </div>
  <Hotkeys
    replaceBody={(hotkey) => {
      input.body = input.body + hotkey;
    }}
    markerColors={currentProject.markerColors}
    {submitLog}
  />
  <table class="table">
    <thead>
      <tr class="flex">
        <td class="grow">Logg</td>
        <td class="w-40">TC</td>
        <td class="w-40">time</td>
        <td class="w-40">written by</td>
      </tr>
    </thead>
    <tbody>
      {#each $recentLogs as log (log.id)}
        <tr class="flex">
          <td class="grow">{log.body}</td>
          <td class="w-40"
            >{log.timecode.hours
              .toString()
              .padStart(2, "0")}:{log.timecode.minutes
              .toString()
              .padStart(2, "0")}:{log.timecode.seconds
              .toString()
              .padStart(2, "0")}:{log.timecode.frames
              .toString()
              .padStart(2, "0")}</td
          >
          <td class="w-40">{dayjs(log.createdAt).fromNow()}</td>
          <td class="w-40">{log.createdByFullName}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

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
