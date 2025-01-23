<script>
  export let user;
  import ThemeSelector from "../theme/themeSelector.svelte";
  import HotkeysSettings from "./HotkeysSettings.svelte";
  import ProjectSelector from "./ProjectSelector.svelte";
  let dialog;
</script>

<li>
  <a class="" on:click={() => dialog.showModal()}>Settings</a>
</li>
<dialog bind:this={dialog} id="settingsModal" class="modal">
  <div class="modal-box max-w-[80vw] xl:max-w-[60vw] relative">
    <div class="modal-action absolute top-0 right-6">
      <form method="dialog">
        <button class="btn btn-ghost btn-xs">x</button>
      </form>
    </div>
    <h3 class="font-bold text-xl mb-4">Settings</h3>
    <div class="flex flex-col gap-4">
      {#if user}
        <div>
          <h1 class="font-bold text-lg pb-4">Project</h1>
          <ProjectSelector {user} />
        </div>
        <div>
          <h1 class="font-bold text-lg pb-4">Hotkeys</h1>
          <HotkeysSettings />
        </div>
      {/if}
      <div>
        <h1 class="font-bold text-lg pb-4">Theme</h1>
        <ThemeSelector />
      </div>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
