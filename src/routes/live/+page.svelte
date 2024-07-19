<script>
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);

  import { fade } from "svelte/transition";
  import Icon from "@iconify/svelte";

  import { socket } from "$lib/socket.js";

  export let data;

  let holder;
  let fullscreen = false;
  $: logs = data.logs;
  $: user = data.user;
  $: currentProject = data.currentProject;

  socket.on("fetchNewData", async (projectId) => {
    let now = dayjs();
    if (projectId == user.selectedProjectId) {
      const res = await fetch(
        "/api/log?page=0&perPage=50&localDate=" + now.format("YYYY.MM.DD")
      );
      const data = await res.json();
      console.log(data);
      logs = data.logs;
    }
  });

  let clock = "";

  setInterval(() => {
    let time = dayjs();
    clock = time.format("HH:mm:ss");
  }, 50);
</script>

<div
  class="flex flex-col gap-8 {fullscreen
    ? 'p-10 bg-base-100 text-base-content'
    : ''}"
  bind:this={holder}
>
  <div class="flex justify-between">
    <h1 class="text-3xl font-bold text-center hidden lg:block lg:text-left">
      Live {fullscreen ? currentProject.name : ""}
    </h1>
    <div class="flex flex-row gap-4 align-middle">
      <div class="text-3xl font-bold">
        {clock}
      </div>
      <button
        on:click={() => {
          if (fullscreen) {
            document.exitFullscreen();
          } else {
            holder.requestFullscreen();
          }
          fullscreen = !fullscreen;
        }}
        ><Icon
          icon={fullscreen ? "mdi:fullscreen-exit" : "mdi:fullscreen"}
        /></button
      >
    </div>
  </div>
  <table class="table text-xl">
    <thead>
      <tr class="flex">
        <td class="w-full">Logg</td>
        <td class="w-40 text-center">TC</td>
        <td class="w-40 text-center">written by</td>
      </tr>
    </thead>
    <tbody>
      {#each logs as log (log.id)}
        <tr class="flex" transition:fade>
          <td class="w-full">{log.body}</td>
          <td class="w-40 text-center"
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
          <td class="w-40 text-center">{log.createdByFullName}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
