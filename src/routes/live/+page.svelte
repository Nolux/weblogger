<script>
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);

  import { slide } from "svelte/transition";
  import Icon from "@iconify/svelte";

  import { socket, socketStatus } from "$lib/socket.js";

  export let data;

  let holder;
  let fullscreen = false;
  $: logs = data.logs;
  $: user = data.user;
  $: currentProject = data.currentProject;

  socket.emit("joinProject", data.currentProject.id);

  socket.on("fetchNewData", async (projectId) => {
    let now = dayjs();
    if (projectId == user.selectedProjectId) {
      const res = await fetch(
        "/api/log?page=0&perPage=50&localDate=" + now.format("YYYY.MM.DD")
      );
      const data = await res.json();
      logs = data.logs;
    }
  });

  let clock = dayjs().format("HH:mm:ss");

  setInterval(() => {
    clock = dayjs().format("HH:mm:ss");
  }, 800);
</script>

<div
  class="flex flex-col gap-8 {fullscreen
    ? 'p-10 bg-base-100 text-base-content'
    : ''}"
  bind:this={holder}
>
  <div class="flex justify-between">
    <h1
      class="w-full text-3xl font-bold text-center hidden lg:block lg:text-left"
    >
      Live
      {fullscreen ? `Project ${currentProject.name}` : ""}
    </h1>
    <div
      class="flex flex-row gap-4 w-full justify-center lg:justify-end align-middle place-items-center"
    >
      <div class="text-3xl font-bold">
        {clock}
      </div>
      <div
        class="w-2 h-2 tooltip tooltip-bottom rounded {$socketStatus
          ? 'bg-green-500'
          : 'bg-red-500'}"
        data-tip="Server status"
      ></div>
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
  <div class="grid grid-cols-6 p-4">
    <div class="col-span-6 text-md hidden lg:block text-xs">Body</div>
    <div class="divider divider-neutral col-span-6"></div>

    {#each logs as log (log.id)}
      <div
        class="col-span-6 w-full lg:col-span-5 text-xl lg:text-2xl"
        transition:slide
      >
        {log.body}
      </div>
      <div
        class="flex flex-col w-full col-span-6 lg:col-span-1 justify-center text-center pt-4 lg:pt-0 lg:justify-start align-middle"
        transition:slide
      >
        <div class="lg:text-right font-bold lg:text-2xl">
          {log.timecode.hours.toString().padStart(2, "0")}:{log.timecode.minutes
            .toString()
            .padStart(2, "0")}:{log.timecode.seconds
            .toString()
            .padStart(2, "0")}:{log.timecode.frames.toString().padStart(2, "0")}
        </div>
        <div class="lg:text-right text-xs lg:text-xl">
          {log.createdByFullName}
        </div>
      </div>
      <div class="divider divider-neutral col-span-6" transition:slide></div>
    {/each}
  </div>
</div>
