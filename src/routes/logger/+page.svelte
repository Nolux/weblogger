<script>
  import { recentLogs } from "$lib/fake.js";

  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);

  let timecode = "00:00:00:00";
  let inTimecode = "XX:XX:XX:XX";
  setInterval(() => {
    timecode =
      dayjs().format("HH:mm:ss:") +
      Math.floor(dayjs().millisecond() / 40)
        .toString()
        .padStart(2, "0");
  }, 50);
</script>

<div class="h-screen flex flex-col gap-8">
  <h1 class="text-3xl text-bold text-center hidden lg:block lg:text-left">
    Logger
  </h1>
  <div class="grid lg:grid-cols-4 w-full gap-4">
    <textarea
      class="lg:col-span-3 grow text-xl textarea textarea-lg textarea-primary p-2"
      placeholder="Logger"
      rows={8}
    ></textarea>
    <div
      class="border border-primary p-4 flex flex-col gap-4 text-center font-mono xl:text-3xl text-2xl text-bold select-none"
    >
      <div class="tooltip lg:tooltip-left" data-tip="TC right now">
        <div>TC: {timecode}</div>
      </div>
      <div class="tooltip lg:tooltip-left" data-tip="In-point for log TC">
        <div
          on:click={() => {
            inTimecode =
              dayjs().format("HH:mm:ss:") +
              Math.floor(dayjs().millisecond() / 40)
                .toString()
                .padStart(2, "0");
          }}
        >
          IN: {inTimecode}
        </div>
      </div>
      <div class="divider"></div>
      <div class="flex gap-2">
        <button class="btn btn-lg grow">Submit</button><button
          class="btn btn-lg">Reset</button
        >
      </div>
    </div>
  </div>
  <div class="w-full grid gap-2 grid-cols-2 lg:grid-cols-5 justify-around">
    <button class="btn">1: tekst her</button><button class="btn"
      >2: tekst her</button
    ><button class="btn">3: tekst her</button><button class="btn"
      >4: tekst her</button
    ><button class="btn">5: tekst her</button>
  </div>

  <table class="table">
    <thead>
      <tr class="flex">
        <td class="grow">Logg</td>
        <td class="w-40">time</td>
        <td class="w-40">written by</td>
      </tr>
    </thead>
    <tbody>
      {#each recentLogs as log}
        <tr class="flex">
          <td class="grow">{log.body}</td>
          <td class="w-40">{dayjs(log.createdAt).fromNow()}</td>
          <td class="w-40">{log.createdByFullName}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
