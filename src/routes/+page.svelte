<script>
  export let data;

  $: user = data.user;
</script>

<div class="flex flex-col gap-8">
  <h1 class="text-3xl font-bold text-center hidden lg:block lg:text-left">
    {user
      ? `Welcome back ${user.firstName} to Weblogger`
      : "Welcome to Weblogger"}
  </h1>
  {#if user}
    <h2 class="text-xl text-center">Select module:</h2>
    <div class="flex flex-col lg:flex-row justify-around items-center gap-4">
      <a href="/logger" class="text-center flex-1">
        <div class="text-xl font-bold">LOGGER</div>
        <div>Live log an event</div>
      </a>
      <div class="divider divider-horizontal"></div>
      <a href="/postlogger" class="text-center flex-1">
        <div class="text-xl font-bold">POST LOGGER</div>
        <div>Log an event after the fact</div>
      </a>
      <div class="divider divider-horizontal"></div>
      <a href="/viewer" class="text-center flex-1">
        <div class="text-xl font-bold">VIEWER</div>
        <div>View all the logs created so far, and export them</div>
      </a>
    </div>
  {:else}
    <h2 class="text-xl">Sign in using the sidebar or menu top left</h2>
  {/if}
</div>
