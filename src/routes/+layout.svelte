<script>
  import { goto } from "$app/navigation";
  import Alerts from "$lib/components/alerts/Alerts.svelte";
  import SettingsModal from "$lib/components/menu/SettingsModal.svelte";
  import "../app.css";
  import Icon from "@iconify/svelte";

  export let data;
  let sideBarOpen = false;

  $: user = data.user;
  $: currentProject = data.currentProject;

  const gotoLink = (e) => {
    sideBarOpen = false;
    goto(e.target.href);
  };
</script>

<Alerts />
<div class="drawer lg:drawer-open">
  <input
    bind:checked={sideBarOpen}
    id="sidebar"
    type="checkbox"
    class="drawer-toggle"
  />
  <div class="flex relative flex-col drawer-content">
    <label
      for="sidebar"
      aria-label="close sidebar"
      class="drawer-overlay lg:hidden"
    ></label>

    <div class="overflow-scroll p-4 grow no-scrollbar">
      <div class="flex justify-between items-center pb-4 select-none lg:hidden">
        <label for="sidebar" class="z-40 btn btn-ghost drawer-button lg:hidden">
          <Icon icon="mdi-light:menu" width="34"></Icon></label
        >
        <a href="/" class="text-3xl font-bold"
          >Weblogger <span class="text-xs">2.0</span></a
        >
        {#if user}
          <div class="avatar placeholder aspect-square">
            <div class="w-12 rounded-full bg-info text-info-content">
              <span class="text-xl"
                >{user.firstName.charAt(0)}{user.lastName.charAt(0)}</span
              >
            </div>
          </div>
        {/if}
      </div>
      <slot />
    </div>
  </div>
  <div class="z-40 border-r drawer-side border-base-300">
    <label for="sidebar" aria-label="close sidebar" class="drawer-overlay"
    ></label>
    <ul
      class="flex flex-col gap-4 p-4 w-80 h-full menu bg-base-200 text-base-content lg:justify-between lg:text-xl"
    >
      <li class="text-3xl">
        <a class="font-bold" on:click={gotoLink} href="/"
          >Weblogger <span class="text-xs">2.0</span></a
        >
      </li>
      <div class="flex flex-col gap-8 grow lg:gap-10">
        {#if user}
          <div class="justify-self-start">
            <li class="p-4 select-none text-md">
              Project: {currentProject.name}
            </li>
            <li><a on:click={gotoLink} href="/logger/">Logger</a></li>
            <li><a on:click={gotoLink} href="/postlogger/">Post Logger</a></li>
            <li><a on:click={gotoLink} href="/viewer/">Viewer</a></li>
            <li><a on:click={gotoLink} href="/search/">Search</a></li>
            <li><a on:click={gotoLink} href="/live/">Live</a></li>
          </div>
          <div>
            {#if user.isAdmin}
              <li><a on:click={gotoLink} href="/admin">Admin</a></li>
            {/if}
            {#if user.projectController?.includes(user.selectedProjectId) || user.isAdmin}
              <li>
                <a on:click={gotoLink} href="/controller">Project Controller</a>
              </li>
            {/if}
          </div>
        {:else}
          <div>
            <li><a on:click={gotoLink} href="/login/">Sign In</a></li>
          </div>
        {/if}
        <div>
          <SettingsModal {user} />
        </div>
      </div>
      {#if user}
        <div>
          <div class="flex justify-between items-center pb-4 w-full">
            <div class="avatar placeholder">
              <div class="w-14 rounded-full bg-info text-info-content">
                <span class="text-3xl"
                  >{user.firstName.charAt(0)}{user.lastName.charAt(0)}</span
                >
              </div>
            </div>
            <div class="text-2xl tooltip" data-tip="Open profile">
              <a on:click={gotoLink} href="/profile">
                {user.fullName}
              </a>
            </div>
            <div>
              <a class="rounded-full btn btn-ghost" href="/login/signout">
                <Icon
                  icon="mdi:exit-to-app"
                  width="24"
                  height="24"
                  style="fill-current"
                ></Icon>
              </a>
            </div>
          </div>
        </div>
      {/if}
    </ul>
  </div>
</div>
