<script>
  import SettingsModal from "$lib/components/menu/SettingsModal.svelte";
  import "../app.css";
  import Icon from "@iconify/svelte";

  export let data;
  let sideBarOpen = false;

  $: user = data.user;
  $: console.log(user);
</script>

<div class="drawer lg:drawer-open">
  <input
    bind:checked={sideBarOpen}
    id="sidebar"
    type="checkbox"
    class="drawer-toggle"
  />
  <div class="drawer-content flex flex-col">
    <label
      for="sidebar"
      class="btn absolute left-2 top-2 btn-ghost drawer-button lg:hidden"
    >
      <Icon icon="mdi-light:menu" width="34"></Icon></label
    >
    <label for="sidebar" aria-label="close sidebar" class="drawer-overlay"
    ></label>
    <div class="lg:hidden flex justify-around py-4 select-none border">
      <a class="font-bold text-3xl"
        >Weblogger <span class="text-xs">2.0</span></a
      >
      {#if user}
        <div class="avatar placeholder absolute top-4 right-2">
          <div class="bg-primary text-neutral-content rounded-full w-10">
            <span class="text-xl"
              >{user.firstName.charAt(0)}{user.lastName.charAt(0)}</span
            >
          </div>
        </div>
      {/if}
    </div>
    <div class="mt-8 mx-4">
      <slot />
    </div>
  </div>
  <div class="drawer-side">
    <label for="sidebar" aria-label="close sidebar" class="drawer-overlay"
    ></label>
    <ul
      class="menu p-4 w-80 h-full bg-base-200 text-base-content flex flex-col justify-between"
    >
      <div class="grow w-full flex flex-col gap-4 text-lg font-semibold">
        <li class="text-3xl">
          <a class="font-bold">Weblogger <span class="text-xs">2.0</span></a>
        </li>

        {#if user}
          <li><a href="/logger/">Logger</a></li>
          <li><a href="/postlogger/">Post Logger</a></li>
          <li><a href="/viewer/">Viewer</a></li>
          {#if user.isAdmin}
            <div class="w-full divider"></div>
            <li><a href="/admin">Admin</a></li>
          {/if}
        {:else}
          <li><a href="/login/">Sign In</a></li>
          <li><a href="/login/register">Register</a></li>
        {/if}
        <div class="w-full divider"></div>
        <SettingsModal {user} />
      </div>
      {#if user}
        <div class="flex items-center justify-between w-full pb-4">
          <div class="avatar placeholder">
            <div class="bg-primary text-neutral-content rounded-full w-14">
              <span class="text-3xl"
                >{user.firstName.charAt(0)}{user.lastName.charAt(0)}</span
              >
            </div>
          </div>
          <div class="text-2xl">{user.fullName}</div>
          <div>
            <a class="btn btn-ghost rounded-full" href="/login/signout">
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
