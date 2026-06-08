<script>
  import { socket } from "$lib/socket.js";

  import { shortcut } from "$lib/components/hotkeys/shortcut.js";
  import { tcOffsets } from "$lib/stores/tcOffsetStore.js";
  import { timecodeSource } from "$lib/stores/timecodeSourceStore.js";
  import {
    browserClockSnapshot,
    isFreshLocalLtcSnapshot,
    toLocalDateString,
  } from "$lib/timecode/timecode.js";
  import {
    connectLocalLtc,
    localLtcState,
    disconnectLocalLtc,
  } from "$lib/timecode/ltcClient.js";

  import Hotkeys from "$lib/components/hotkeys/Hotkeys.svelte";
  import TimecodeSettingsModal from "$lib/components/logger/TimecodeSettingsModal.svelte";

  import {
    submitHotkey,
    resetHotkey,
    timecodeHotkey,
  } from "$lib/stores/hotkeysStore.js";

  import { onMount } from "svelte";
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import Icon from "@iconify/svelte";
  import { slide } from "svelte/transition";

  import { persisted } from "svelte-persisted-store";
  import { AlertsStore } from "$lib/stores/alertsStore.js";
  import PersonalHotkeys from "$lib/components/hotkeys/PersonalHotkeys.svelte";
  let { data } = $props();

  onMount(() => {
    if ($timecodeSource.mode === "local-ltc") {
      connectLocalLtc($timecodeSource.ltcDeviceId);
    }
    return () => {
      if ($timecodeSource.mode === "local-ltc") {
        disconnectLocalLtc();
      }
    };
  });
  dayjs.extend(relativeTime);

  let timecode = $state("00:00:00:00");
  let inTimecode = $state("XX:XX:XX:XX");
  let submittingLog = $state(false);
  let textarea = $state();

  const getCurrentTimecodeSnapshot = ({ allowStale = true } = {}) => {
    if ($timecodeSource.mode === "local-ltc") {
      const snapshot = $localLtcState.snapshot;
      if (!allowStale && !isFreshLocalLtcSnapshot(snapshot)) {
        return null;
      }
      if (snapshot) {
        return {
          ...snapshot,
          localDate: browserClockSnapshot(dayjs(), {
            hours: 0,
            minutes: 0,
            seconds: 0,
            frames: 0,
          }).localDate,
        };
      }
    }

    return browserClockSnapshot(dayjs(), $tcOffsets, $timecodeSource.fps);
  };

  let currentSnapshot = $state(getCurrentTimecodeSnapshot());

  let input = $state({
    timecode: {},
    localDate: browserClockSnapshot(dayjs(), $tcOffsets, $timecodeSource.fps)
      .localDate,
  });

  let loggerInput = persisted("loggerInput", "");

  socket.emit("joinProject", data.currentProject.id);

  socket.on("fetchNewData", async (projectId) => {
    if (projectId == user.selectedProjectId) {
      const snapshot = getCurrentTimecodeSnapshot();
      const res = await fetch(
        "/api/log?page=0&perPage=10&localDate=" +
          toLocalDateString(snapshot.localDate),
      );
      const data = await res.json();
      logs = data.logs;
    }
  });

  // Refresh Timecode display/date from the selected source.
  setInterval(() => {
    currentSnapshot = getCurrentTimecodeSnapshot();
    timecode = currentSnapshot.timecodeString;
    input.localDate = currentSnapshot.localDate;
  }, 50);

  const submitLog = async () => {
    submittingLog = true;
    const snapshot = getCurrentTimecodeSnapshot({ allowStale: false });
    if (!snapshot) {
      AlertsStore.addAlert(
        "Local LTC is not locked. Connect a valid LTC input before submitting.",
        "warning",
      );
      submittingLog = false;
      return;
    }

    if (inTimecode == "XX:XX:XX:XX") {
      setTimecodeToNow();
    }

    input.localDate = snapshot.localDate;

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
      localDate: snapshot.localDate,
    };
    loggerInput.set("");
    submittingLog = false;
    setTimeout(() => {
      textarea.select();
    }, 50);
  };

  const setTimecodeToNow = (forced = false) => {
    textarea?.select();
    const snapshot = getCurrentTimecodeSnapshot({ allowStale: false });
    if (!snapshot) {
      AlertsStore.addAlert(
        "Local LTC is not locked. Connect a valid LTC input before setting TC.",
        "warning",
      );
      return;
    }

    if (inTimecode == "XX:XX:XX:XX" || forced) {
      inTimecode = snapshot.timecodeString;
    }
  };
  let logs = $state(data.logs);
  let user = $derived(data.user);
  let currentProject = $derived(data.currentProject);
  $effect(() => {
    logs = data.logs;
  });
</script>

<div class="flex flex-col gap-8">
  <h1 class="hidden text-3xl font-bold text-center lg:block lg:text-left">
    Logger
  </h1>
  <div class="grid grid-cols-4 gap-4 w-full">
    <textarea
      bind:this={textarea}
      bind:value={$loggerInput}
      disabled={submittingLog}
      class="col-span-4 p-2 w-full text-xl lg:col-span-2 grow textarea textarea-lg textarea-primary"
      placeholder="Logger"
      rows={8}
    ></textarea>
    <div
      class="flex relative flex-col col-span-4 gap-4 p-4 border lg:col-span-2 border-primary"
    >
      <div class="absolute top-2 right-2 z-10">
        <TimecodeSettingsModal />
      </div>
      <div
        class="mt-4 text-2xl font-bold text-center select-none xl:text-3xl tooltip lg:tooltip-left"
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
          {#if $timecodeSource.mode === "local-ltc"}
            <div class="flex items-center justify-center gap-2 text-sm mt-1">
              <span
                class="inline-block w-3 h-3 rounded-full {$localLtcState.status ===
                'locked'
                  ? 'bg-success'
                  : $localLtcState.status === 'listening'
                    ? 'bg-warning'
                    : 'bg-error'}"
              ></span>
              <span class="opacity-70">LTC {$localLtcState.status}</span>
            </div>
          {/if}
        </div>
      </div>
      <div
        class="text-2xl font-bold text-center select-none xl:text-3xl tooltip lg:tooltip-left"
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
          onclick={() => {
            setTimecodeToNow(true);
          }}
        >
          IN: <span class="font-mono">{inTimecode}</span>
        </div>
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
          class="py-8 w-1/2 btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl"
          use:shortcut={{
            shift: $resetHotkey.modifiers.shift,
            control: $resetHotkey.modifiers.control,
            alt: $resetHotkey.modifiers.alt,
            code: $resetHotkey.key,
          }}
          onclick={() => {
            input.localDate = getCurrentTimecodeSnapshot().localDate;

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
  <PersonalHotkeys
    replaceBody={(hotkey) => {
      loggerInput.set($loggerInput + hotkey);
    }}
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
