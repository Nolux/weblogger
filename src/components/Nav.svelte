<script>
  import { user } from "$lib/store/userStore";
  import { theme, themeChoices } from "$lib/store/themeStore";

  const links = [
    {
      name: "Viewer",
      url: "/viewer",
    },
    {
      name: "Logger",
      url: "/logger",
    },
  ];
</script>

<div class="navbar bg-base-200">
  <div class="flex-1">
    <a class="btn btn-ghost normal-case text-xl" href="/">Weblogger</a>
  </div>
  <div class="flex-none">
    {#if $user.user && $user.user.selectedProject}
      <div class="dropdown">
        <button tabindex="0" class="btn btn-xs btn-ghost"
          >{$user.user.selectedProject.name}</button
        >
        <ul
          tabindex="0"
          class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li>
            {#each $user.user.assignedProjects as project}
              <button
                on:click={() => {
                  user.selectProject(project);
                }}>{project.name}</button
              >
            {/each}
          </li>
        </ul>
      </div>
      <div class="divider divider-horizontal" />
      <div class="dropdown">
        <button tabindex="0" class="btn btn-xs btn-ghost">{$theme}</button>
        <ul
          tabindex="0"
          class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          {#if $user.user}
            {#each $themeChoices as choice}
              <li>
                <button on:click={() => theme.set(choice)}>{choice}</button>
              </li>
            {/each}
          {:else}
            <li>
              <a href="/login">Log In</a>
            </li>
          {/if}
        </ul>
      </div>
      <div class="divider divider-horizontal" />
    {/if}
    <div class="dropdown dropdown-end">
      <button tabindex="0" class="">
        <div class="avatar placeholder m-4">
          {#if $user.user}
            <div
              class="w-14 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 hover:brightness-75"
            >
              {#if $user.user.photoURL}
                <img src={$user.user.photoURL} />
              {:else}
                <span>user</span>
              {/if}
            </div>
          {:else}
            <div class="w-14 " />
          {/if}
        </div></button
      >
      <ul
        tabindex="0"
        class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
      >
        {#if $user.user}
          {#each links as link}
            <li><a href={link.url}>{link.name}</a></li>
          {/each}
          <li><a href="/login/signOut">Sign Out</a></li>
        {:else}
          <li>
            <a href="/login">Log In</a>
          </li>
        {/if}
      </ul>
    </div>
  </div>
</div>
