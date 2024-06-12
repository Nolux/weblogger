<script>
  export let data;

  $: user = data.user;
  $: userAgent = data.userAgent.toLowerCase();

  $: isSafari = userAgent.indexOf("safari/") > -1;

  $: console.log(isSafari);

  console.log(isSafari);
</script>

<div class="flex flex-col gap-8">
  <h1 class="text-3xl font-bold text-center lg:text-left">
    {user ? `Welcome back ${user.firstName}!` : "Welcome to Weblogger"}
  </h1>
  {#if user}
    <h2 class="text-xl text-center">Select module:</h2>
    <div class="flex flex-col lg:flex-row justify-around items-stretch gap-4">
      <a
        href="/logger"
        class="text-center flex-1 bg-base-300 p-4 w-full rounded hover:bg-base-200"
      >
        <div class="text-xl font-bold">LOGGER</div>
        <div>Live log an event</div>
      </a>
      <div class="divider divider-horizontal"></div>
      <a
        href="/postlogger"
        class="text-center flex-1 bg-base-300 p-4 w-full rounded hover:bg-base-200"
      >
        <div class="text-xl font-bold">POST LOGGER</div>
        <div>Log an event after the fact</div>
      </a>
      <div class="divider divider-horizontal"></div>
      <a
        href="/viewer"
        class="text-center flex-1 bg-base-300 p-4 w-full rounded hover:bg-base-200"
      >
        <div class="text-xl font-bold">VIEWER</div>
        <div>View all the logs created so far, and export them</div>
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
        class="absolute top-1/2 opacity-50 hover:opacity-100 w-full flex flex-col lg:flex-row justify-around items-stretch gap-4"
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
