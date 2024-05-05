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
    <h2 class="text-xl">Select module from sidebar or menu top left</h2>
  {:else}
    <h2 class="text-xl">Sign in using the sidebar or menu top left</h2>
  {/if}
</div>
