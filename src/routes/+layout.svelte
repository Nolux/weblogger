<script>
  import ThemeSelector from "$lib/components/theme/themeSelector.svelte";
  import "../app.css";
  import Icon from "@iconify/svelte";

  export let data;
  let sideBarOpen = false;
  $: console.log(sideBarOpen);

  $: user = data.user;
</script>

<div class="drawer lg:drawer-open">
  <input
    bind:checked={sideBarOpen}
    id="my-drawer-2"
    type="checkbox"
    class="drawer-toggle"
  />
  <div class="drawer-content flex flex-col">
    <label
      for="my-drawer-2"
      class="btn absolute left-2 top-2 btn-ghost drawer-button lg:hidden"
    >
      <Icon icon="mdi-light:menu" width="34"></Icon></label
    >
    <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"
    ></label>
    <div class="lg:hidden flex justify-center py-4 select-none border">
      <a class="font-bold text-3xl"
        >Weblogger <span class="text-xs">2.0</span></a
      >
    </div>
    <div class="mt-8 mx-4">
      <slot />
    </div>
  </div>
  <div class="drawer-side">
    <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"
    ></label>
    <ul
      class="menu p-4 w-80 min-h-full bg-base-200 text-base-content h-screen flex flex-col justify-between"
    >
      <div>
        <li class="text-3xl">
          <a class="font-bold">Weblogger <span class="text-xs">2.0</span></a>
        </li>

        {#if user}
          <li><a href="/logger/">Logger</a></li>
          <li><a href="/postlogger/">Post Logger</a></li>
          <li><a href="/viewer/">Viewer</a></li>
          <li><a href="/search/">Search</a></li>
          {#if user.isAdmin}
            <li><a href="/admin">Admin</a></li>
          {/if}
        {:else}
          <li><a href="/login/">Sign In</a></li>
          <li><a href="/login/register">Register</a></li>
        {/if}
        <ThemeSelector />
      </div>
      {#if user}
        <div class="flex items-center justify-between w-full mb-4">
          <div class="avatar">
            <div class="h-12 w-12 mx-2 rounded-full">
              <img
                src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
              />
            </div>
          </div>
          <div class="text-2xl">name nameson</div>
          <div>
            <a href="/login/signout">
              <Icon
                icon="mdi:exit-to-app"
                width="24"
                height="24"
                style="fill-current"
              ></Icon>
            </a>
          </div>
        </div>
      {/if}
    </ul>
  </div>
</div>
