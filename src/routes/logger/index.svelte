<script>
  import { onMount } from "svelte";
  import dayjs from "dayjs";
  import hotkeys from "hotkeys-js";
  import { collection, addDoc } from "firebase/firestore";

  import { user } from "$lib/store/userStore";

  import { alertStore } from "$lib/store/alertStore";

  import { Log, saveLog } from "$lib/classes/Log.js";

  import RecentLogs from "../../components/logger/RecentLogs.svelte";
  import Timecode from "../../components/logger/Timecode.svelte";

  let loggerInput = {
    body: "",
    timecode: { hours: 0, minutes: 0, seconds: 0, frames: 0 },
  };

  const displayAsDobbleDigit = (digit) => {
    return digit < 10 ? "0" + digit : digit;
  };

  onMount(() => {
    hotkeys("ctrl+l", (event) => {
      event.preventDefault();
      loggerInput.body += " hello";
    });
    hotkeys.filter = (e) => {
      return true;
    };

    hotkeys("ctrl+t", (e, h) => {
      console.log(e);
      console.log(h);
    });
  });

  const reset = () => {
    loggerInput = {
      body: "",
      timecode: { hours: 0, minutes: 0, seconds: 0, frames: 0 },
    };
  };

  const postLog = async () => {
    const { body, timecode } = loggerInput;
    const { hours, minutes, seconds, frames } = timecode;

    if (body == "") {
      alertStore.add({ message: "You must enter a body", type: "error" });
      return;
    }
    let time = dayjs();
    const log = new Log({
      body,
      user: $user.user,
      project: $user.user.selectedProject,
      localeDate: {
        day: time.day(),
        month: time.month(),
        year: time.year(),
      },
      timecode: {
        hours,
        minutes,
        seconds,
        frames,
      },
    });
    console.log(log);
    saveLog(log, () => reset());
  };
</script>

<div class=" container mx-auto m-6 flex flex-col ">
  <div class="flex basis-2/4 flex-row pb-6">
    <div class="basis-3/4 form-control pr-4">
      <textarea
        class="textarea textarea-bordered text-xl"
        rows="12"
        bind:value={loggerInput.body}
        placeholder="Logg"
      />
    </div>
    <div
      class="basis-1/4 flex flex-col pr-4 text-center font-mono h-100 select-none"
    >
      <div class="basis-1/2 mb-2">
        <Timecode staticTime={false} />
        <Timecode
          staticTime={true}
          clock={`${displayAsDobbleDigit(
            loggerInput.timecode.hours
          )}:${displayAsDobbleDigit(
            loggerInput.timecode.minutes
          )}:${displayAsDobbleDigit(
            loggerInput.timecode.seconds
          )}:${displayAsDobbleDigit(loggerInput.timecode.frames)}`}
        />
      </div>
      <div class="basis-1/2 text-5xl">
        <button
          class="btn btn-lg"
          on:click={() => {
            let time = dayjs();
            loggerInput.timecode.hours = time.hour();
            loggerInput.timecode.minutes = time.minute();
            loggerInput.timecode.seconds = time.second();
            loggerInput.timecode.frames = Math.floor(time.millisecond() / 40);
            postLog();
          }}>Submit</button
        >
        <button
          class="btn btn-lg"
          on:click={() => {
            reset();
          }}>Reset</button
        >
      </div>
    </div>
  </div>
  <div class="h-80">
    <RecentLogs />
  </div>
</div>
