<script>
  export let data;
  import { socket } from "$lib/socket.js";

  import { shortcut } from "$lib/components/hotkeys/shortcut.js";
  import { tcOffsets } from "$lib/stores/tcOffsetStore.js";

  import Hotkeys from "$lib/components/hotkeys/Hotkeys.svelte";
  import TcOffsetModal from "$lib/components/logger/TcOffsetModal.svelte";

  import {
    submitHotkey,
    resetHotkey,
    timecodeHotkey,
  } from "$lib/stores/hotkeysStore.js";

  $: logs = data.logs;
  $: user = data.user;
  $: currentProject = data.currentProject;

  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import Icon from "@iconify/svelte";
  import { slide } from "svelte/transition";

  import { persisted } from "svelte-persisted-store";
  import { AlertsStore } from "$lib/stores/alertsStore.js";
  dayjs.extend(relativeTime);

  let timecode = "00:00:00:00";
  let inTimecode = "XX:XX:XX:XX";
  let submittingLog = false;
  let textarea;

  let now = dayjs()
    .add($tcOffsets.hours, "hour")
    .add($tcOffsets.minutes, "minute")
    .add($tcOffsets.seconds, "second");

  let input = {
    timecode: {},
    localDate: { year: now.year(), month: now.month() + 1, day: now.date() },
  };

  let loggerInput = persisted("loggerInput", "");

  socket.emit("joinProject", data.currentProject.id);

  socket.on("fetchNewData", async (projectId) => {
    if (projectId == user.selectedProjectId) {
      let now = dayjs()
        .add($tcOffsets.hours, "hour")
        .add($tcOffsets.minutes, "minute")
        .add($tcOffsets.seconds, "second");
      const res = await fetch(
        "/api/log?page=0&perPage=10&localDate=" + now.format("YYYY.MM.DD")
      );
      const data = await res.json();
      logs = data.logs;
    }
  });

  // Refresh Timecode display
  setInterval(() => {
    let time = dayjs()
      .add($tcOffsets.hours, "hour")
      .add($tcOffsets.minutes, "minute")
      .add($tcOffsets.seconds, "second");
    timecode =
      time.format("HH:mm:ss:") +
      Math.floor(time.millisecond() / 40)
        .toString()
        .padStart(2, "0");
  }, 50);

  // Refresh Date
  setInterval(() => {
    let now = dayjs()
      .add($tcOffsets.hours, "hour")
      .add($tcOffsets.minutes, "minute")
      .add($tcOffsets.seconds, "second");

    input.localDate = {
      year: now.year(),
      month: now.month() + 1,
      day: now.date(),
    };
  }, 1000);

  const submitLog = async () => {
    submittingLog = true;
    let now = dayjs()
      .add($tcOffsets.hours, "hour")
      .add($tcOffsets.minutes, "minute")
      .add($tcOffsets.seconds, "second");
    if (inTimecode == "XX:XX:XX:XX") {
      setTimecodeToNow();
    }

    input.localDate = {
      year: now.year(),
      month: now.month() + 1,
      day: now.date(),
    };

    input.timecode = {
      hours: parseInt(inTimecode.split(":")[0]),
      minutes: parseInt(inTimecode.split(":")[1]),
      seconds: parseInt(inTimecode.split(":")[2]),
      frames: parseInt(inTimecode.split(":")[3]),
    };

    const res = await fetch("/api/log", {
      method: "POST",
      body: JSON.stringify({ ...input, body: $loggerInput }),
    });
    if (!res.ok) {
      const json = await res.json();
      AlertsStore.addAlert(json.message, "warning");
      submittingLog = false;

      return;
    }
    socket.emit("newData", user.selectedProjectId);
    inTimecode = "XX:XX:XX:XX";

    input = {
      timecode: {},
      localDate: {
        year: now.year(),
        month: now.month() + 1,
        day: now.date(),
      },
    };
    loggerInput.set("");
    submittingLog = false;
  };

  const setTimecodeToNow = (forced = false) => {
    textarea.select();
    let now = dayjs()
      .add($tcOffsets.hours, "hour")
      .add($tcOffsets.minutes, "minute")
      .add($tcOffsets.seconds, "second");
    if (inTimecode == "XX:XX:XX:XX" || forced) {
      inTimecode =
        now.format("HH:mm:ss:") +
        Math.floor(now.millisecond() / 40) // TODO: check frame rate?
          .toString()
          .padStart(2, "0");
    }
  };
</script>

<div class="flex flex-col gap-8">
  <h1 class="text-3xl font-bold text-center hidden lg:block lg:text-left">
    Logger
  </h1>
  <div class="grid grid-cols-4 w-full gap-4">
    <textarea
      bind:this={textarea}
      bind:value={$loggerInput}
      disabled={submittingLog}
      class="col-span-4 lg:col-span-2 grow text-xl textarea textarea-lg textarea-primary p-2"
      placeholder="Logger"
      rows={8}
    ></textarea>
    <div
      class="relative col-span-4 lg:col-span-2 border border-primary p-4 flex flex-col gap-4"
    >
      <div class="absolute top-2 right-2 z-10">
        <TcOffsetModal />
      </div>
      <div
        class="mt-4 text-center xl:text-3xl text-2xl font-bold select-none tooltip lg:tooltip-left"
        data-tip="TC right now"
      >
        <div class="flex flex-col">
          <div class="text-lg">
            {input.localDate.year}.{input.localDate.month}.{input.localDate.day}
          </div>
          <div>
            TC: <span class="font-mono">
              {timecode}
            </span>
          </div>
        </div>
      </div>
      <div
        class="text-center xl:text-3xl text-2xl font-bold select-none tooltip lg:tooltip-left"
        data-tip="In-point for log TC click or {$timecodeHotkey.modifiers
          .control
          ? 'CTL + '
          : ''}{$timecodeHotkey.modifiers.shift
          ? 'SHIFT + '
          : ''}{$timecodeHotkey.modifiers.alt
          ? 'ALT + '
          : ''}{$timecodeHotkey.key} to SET"
      >
        <div
          use:shortcut={{
            shift: $timecodeHotkey.modifiers.shift,
            control: $timecodeHotkey.modifiers.control,
            alt: $timecodeHotkey.modifiers.alt,
            code: $timecodeHotkey.key,
          }}
          on:click={() => {
            setTimecodeToNow(true);
          }}
        >
          IN: <span class="font-mono">{inTimecode}</span>
        </div>
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
              <span class="loading loading-spinner text-primary loading-sm"
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
            let now = dayjs()
              .add($tcOffsets.hours, "hour")
              .add($tcOffsets.minutes, "minute")
              .add($tcOffsets.seconds, "second");

            input.localDate = {
              year: now.year(),
              month: now.month() + 1,
              day: now.date(),
            };

            loggerInput.set("");
            inTimecode = "XX:XX:XX:XX";
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
  <Hotkeys
    replaceBody={(hotkey) => {
      loggerInput.set($loggerInput + hotkey);
    }}
    markerColors={currentProject.markerColors}
    {setTimecodeToNow}
    {inTimecode}
  />

  <table class="table">
    <thead>
      <tr class="flex">
        <td class="w-full">Logg</td>
        <td class="w-40">TC</td>
        <td class="w-40">time</td>
        <td class="w-40">written by</td>
        <td class="w-20">actions</td>
      </tr>
    </thead>
    <tbody>
      {#each logs as log (log.id)}
        <tr class="flex" transition:slide>
          <td class="w-full">{log.body}</td>
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
            ><a class="btn btn-xs" href="/viewer/{log.id}?editmode=true"
              ><Icon icon="mdi:pencil" /></a
            ></td
          >
        </tr>
      {/each}
    </tbody>
  </table>
</div>
