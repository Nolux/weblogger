<script>
  export let data;

  $: user = data.user;
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
    <div class="flex flex-col lg:flex-row justify-around items-stretch gap-4">
      <a
        href="/login"
        class="text-center flex-1 bg-base-300 p-4 w-full rounded hover:bg-base-200"
      >
        <div class="text-xl font-bold">LOGIN</div>
        <div>Sign in to get access to your project</div>
      </a>
      <div class="divider divider-horizontal"></div>
      <a
        href="/about"
        class="text-center flex-1 bg-base-300 p-4 w-full rounded hover:bg-base-200"
      >
        <div class="text-xl font-bold">ABOUT</div>
        <div>Who made this?!</div>
      </a>
    </div>
  {/if}
</div>
