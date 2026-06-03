<script>
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import { writable } from "svelte/store";
  import { DatePicker } from "@svelte-plugins/datepicker";

  import { socket } from "$lib/socket.js";
  import { submitHotkey, resetHotkey } from "$lib/stores/hotkeysStore.js";
  import { shortcut } from "$lib/components/hotkeys/shortcut.js";

  import Hotkeys from "$lib/components/hotkeys/Hotkeys.svelte";
  import Icon from "@iconify/svelte";
  import { slide } from "svelte/transition";

  import { persisted } from "svelte-persisted-store";
  import { AlertsStore } from "$lib/stores/alertsStore.js";
  import PersonalHotkeys from "$lib/components/hotkeys/PersonalHotkeys.svelte";
  let { data } = $props();

  let logs = $derived(data.logs);
  let user = $derived(data.user);
  let currentProject = $derived(data.currentProject);

  dayjs.extend(relativeTime);

  let input = $state({
    timecode: { hours: 0, minutes: 0, seconds: 0, frames: 0 },
    localDate: { year: 2024, month: 1, day: 1 },
  });
  let postLoggerInput = persisted("postLoggerInput", "");

  let dateInput = $state(dayjs().format("YYYY-MM-DD"));

  let recentLogs = writable([]);

  let submittingLog = $state(false);
  let textarea = $state();

  const submitLog = async () => {
    submittingLog = true;
    input.localDate = {
      year: parseInt(dateInput.split("-")[0]),
      month: parseInt(dateInput.split("-")[1]),
      day: parseInt(dateInput.split("-")[2]),
    };

    const res = await fetch("/api/log", {
      method: "POST",
      body: JSON.stringify({ ...input, body: $postLoggerInput }),
    });

    if (!res.ok) {
      const json = await res.json();
      AlertsStore.addAlert(json.message, "warning");
      submittingLog = false;
      return;
    }
    socket.emit("newData", user.selectedProjectId);

    postLoggerInput.set("");
    let newLogs = $recentLogs;
    newLogs.push(await res.json());
    recentLogs.set(newLogs);
    submittingLog = false;
  };

  let isOpen = $state(false);

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
  <h1 class="hidden text-3xl font-bold text-center lg:block lg:text-left">
    Post-Logger
  </h1>

  <div class="grid gap-4 w-full lg:grid-cols-4">
    <textarea
      bind:this={textarea}
      bind:value={$postLoggerInput}
      disabled={submittingLog}
      class="col-span-4 p-2 w-full h-full text-xl lg:col-span-2 grow textarea textarea-lg textarea-secondary"
      placeholder="Logger"
      rows={8}
    ></textarea>

    <div
      class="flex flex-col gap-4 p-4 text-2xl font-bold text-center border select-none border-secondary lg:col-span-2 xl:text-3xl"
    >
      <div class="flex flex-col gap-2">
        <DatePicker
          enableFutureDates={false}
          showYearControls={true}
          align="right"
          onDayClick={(e) => {
            dateInput = dayjs(e.startDate).format("YYYY-MM-DD");
          }}
          theme="postlogger-datepicker"
          bind:isOpen
          ><div class="w-full tooltip tooltip-secondary" data-tip="Select Date">
            <input
              class="w-full text-2xl font-bold text-center select-none input input-ghost input-lg xl:text-3xl tooltip lg:tooltip-left"
              type="text"
              placeholder="Select date"
              onclick={toggleDatePicker}
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
        <div class="grid grid-cols-4 gap-4 w-full">
          <input
            type="number"
            min="0"
            max="23"
            id="hours"
            class="w-full input"
            placeholder="Hours"
            onkeyup={(e) => enforceMinMax(e, "hours")}
            onchange={(e) => enforceMinMax(e, "hours")}
            value="0"
          />
          <input
            type="number"
            max="59"
            min="0"
            id="minutes"
            class="w-full input"
            placeholder="minutes"
            onkeyup={(e) => enforceMinMax(e, "minutes")}
            onchange={(e) => enforceMinMax(e, "minutes")}
            value="0"
          />
          <input
            type="number"
            max="59"
            min="0"
            id="seconds"
            class="w-full input"
            placeholder="seconds"
            onkeyup={(e) => enforceMinMax(e, "seconds")}
            onchange={(e) => enforceMinMax(e, "seconds")}
            value="0"
          />
          <input
            type="number"
            max="24"
            min="0"
            id="frames"
            class="w-full input"
            placeholder="frames"
            onkeyup={(e) => enforceMinMax(e, "frames")}
            onchange={(e) => enforceMinMax(e, "frames")}
            value="0"
          />
        </div>
        <div class="divider"></div>
        <div class="flex gap-2">
          <button
            class="py-8 w-1/2 btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl"
            use:shortcut={{
              shift: $submitHotkey.modifiers.shift,
              control: $submitHotkey.modifiers.control,
              alt: $submitHotkey.modifiers.alt,
              code: $submitHotkey.key,
            }}
            onclick={() => {
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
            class="py-8 w-1/2 btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl"
            use:shortcut={{
              shift: $resetHotkey.modifiers.shift,
              control: $resetHotkey.modifiers.control,
              alt: $resetHotkey.modifiers.alt,
              code: $resetHotkey.key,
            }}
            onclick={() => {
              postLoggerInput.set("");
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
      postLoggerInput.set($postLoggerInput + hotkey);
      textarea.select();
    }}
    markerColors={currentProject.markerColors}
    {submitLog}
  />
  <PersonalHotkeys
    replaceBody={(hotkey) => {
      postLoggerInput.set($postLoggerInput + hotkey);
      textarea.select();
    }}
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
        <tr class="flex" transition:slide>
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
          <td class="w-20"
            ><a class="btn btn-xs" href="/viewer/{log.id}/?editmode=true"
              ><Icon icon="mdi:pencil" /></a
            ></td
          >
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
    --datepicker-container-background: var(--color-base-100);
    --datepicker-container-border: 1px solid var(--color-secondary);

    --datepicker-calendar-header-text-color: var(--color-base-content);
    --datepicker-calendar-dow-color: var(--color-base-content);
    --datepicker-calendar-day-color: var(--color-secondary);
    --datepicker-calendar-day-color-disabled: var(--color-neutral-content);
    --datepicker-calendar-range-selected-background: var(--color-secondary);

    --datepicker-calendar-header-month-nav-background-hover: var(
      --color-secondary
    );
    --datepicker-calendar-header-month-nav-icon-next-filter: var(
      --color-neutral-content
    );
    --datepicker-calendar-header-month-nav-icon-prev-filter: var(
      --color-neutral-content
    );
    --datepicker-calendar-header-year-nav-icon-next-filter: var(
      --color-neutral-content
    );
    --datepicker-calendar-header-year-nav-icon-prev-filter: var(
      --color-neutral-content
    );

    --datepicker-calendar-split-border: 1px solid pink;

    --datepicker-presets-border: 1px solid pink;
    --datepicker-presets-button-background-active: #ff1683;
    --datepicker-presets-button-color: var(--color-secondary);
    --datepicker-presets-button-color-active: var(--color-secondary);
    --datepicker-presets-button-color-hover: #333;
    --datepicker-presets-button-color-focus: #333;
  }
  :global(.datepicker .calendars-container.right) {
    margin-top: 1em;
    left: 35% !important;
    right: auto !important;
  }
</style>
