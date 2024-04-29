<script>
  export let data;
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import { writable } from "svelte/store";

  import { socket } from "$lib/socket.js";
  import { submitHotkey, resetHotkey } from "$lib/stores/hotkeysStore.js";
  import { shortcut } from "$lib/components/hotkeys/shortcut.js";

  import Hotkeys from "$lib/components/hotkeys/Hotkeys.svelte";

  $: logs = data.logs;
  $: user = data.user;

  dayjs.extend(relativeTime);

  let input = {
    timecode: { hours: 0, minutes: 0, seconds: 0, frames: 0 },
    body: "",
    localDate: { year: 2024, month: 1, day: 1 },
  };

  let dateInput = dayjs().format("YYYY-MM-DD");

  let recentLogs = writable([]);

  const submitLog = async () => {
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
  };

  const imposeMinMax = (el, value) => {
    console.log(el);
    if (value != "") {
      if (parseInt(input.timecode[value]) < parseInt(el.min)) {
        input.timecode[value] = el.min;
      }
      if (parseInt(input.timecode[value]) > parseInt(el.max)) {
        input.timecode[value] = el.max;
      }
    }
  };
</script>

<div class="h-screen flex flex-col gap-8">
  <h1 class="text-3xl text-bold text-center hidden lg:block lg:text-left">
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
      class="border border-secondary p-4 lg:col-span-2 flex flex-col gap-4 text-center font-mono xl:text-3xl text-2xl text-bold select-none"
    >
      <div class="flex flex-col gap-2">
        <div class="tooltip lg:tooltip-left" data-tip="TC right now">
          <input
            type="date"
            max={dayjs().format("YYYY-MM-DD")}
            id="date"
            class="input"
            bind:value={dateInput}
          />
          <div>
            TC: {input.timecode.hours
              .toString()
              .padStart(2, "0")}:{input.timecode.minutes
              .toString()
              .padStart(2, "0")}:{input.timecode.seconds
              .toString()
              .padStart(2, "0")}:{input.timecode.frames
              .toString()
              .padStart(2, "0")}
          </div>
        </div>
        <div class="w-full grid grid-cols-4">
          <input
            type="number"
            max="23"
            min="0"
            id="hours"
            class="input"
            placeholder="Hours"
            bind:value={input.timecode.hours}
            on:keyup={(e) => {
              imposeMinMax(e.target, "hours");
            }}
          />
          <input
            type="number"
            max="59"
            min="0"
            id="minutes"
            class="input"
            placeholder="minutes"
            bind:value={input.timecode.minutes}
            on:keyup={(e) => {
              imposeMinMax(e.target, "minutes");
            }}
          />
          <input
            type="number"
            max="59"
            min="0"
            id="seconds"
            class="input"
            placeholder="seconds"
            bind:value={input.timecode.seconds}
            on:keyup={(e) => {
              imposeMinMax(e.target, "seconds");
            }}
          />
          <input
            type="number"
            max="24"
            min="0"
            id="frames"
            class="input"
            placeholder="frames"
            bind:value={input.timecode.frames}
            on:keyup={(e) => {
              imposeMinMax(e.target, "frames");
            }}
          />
        </div>
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
              <div>Submit</div>
              <div class="text-xs">
                {$submitHotkey.modifiers.control ? "CTL + " : ""}
                {$submitHotkey.modifiers.shift ? "SHIFT + " : ""}
                {$submitHotkey.modifiers.alt ? "ALT + " : ""}
                {$submitHotkey.key}
              </div>
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
