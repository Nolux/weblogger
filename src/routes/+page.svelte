<script>
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  export let data;

  dayjs.extend(relativeTime);

  $: user = data.user;

  $: userAgent = data.userAgent?.toLowerCase();

  $: isSafari = userAgent?.indexOf("safari/") > -1;
</script>

<div class="flex flex-col gap-8">
  <h1 class="text-3xl font-bold text-center lg:text-left">
    {user ? `Welcome back ${user.firstName}!` : "Welcome to Weblogger"}
  </h1>
  {#if user}
    <h2 class="text-xl text-center">Select module</h2>
    <div
      class="grid grid-cols-1 gap-4 justify-around items-stretch lg:grid-cols-2"
    >
      <a href="/logger" class="btn btn-outline btn-primary btn-lg grow">
        <div class="text-xl font-bold lg:text-2xl">LOGGER</div>
      </a>
      <a href="/postlogger" class="btn btn-outline btn-secondary btn-lg grow">
        <div class="text-xl font-bold lg:text-2xl">POST LOGGER</div>
      </a>
      <a href="/viewer" class="btn btn-outline btn-accent btn-lg grow">
        <div class="text-xl font-bold lg:text-2xl">VIEWER</div>
      </a>
      <a href="/live" class="btn btn-outline btn-error btn-lg grow">
        <div class="text-xl font-bold lg:text-2xl">LIVE</div>
      </a>
    </div>
  {:else}
    <div class="relative">
      <a href="/login" class="">
        <video autoplay muted playsinline id="bgVideo">
          <source src={`video/bgvideo.${isSafari ? "mov" : "webm"}`} />
        </video>
      </a>
      <div
        class="flex absolute top-1/2 flex-col gap-4 justify-around items-stretch w-full opacity-50 hover:opacity-100 lg:flex-row"
      ></div>
    </div>
  {/if}
</div>

<style>
  #bgVideo {
    right: 0;
    bottom: 0;
    min-width: 100%;
    min-height: 100%;
  }
</style>
