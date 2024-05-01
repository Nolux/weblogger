<script>
  export let user;
  import ThemeSelector from "../theme/themeSelector.svelte";
  import HotkeysSettings from "./HotkeysSettings.svelte";
  import ProjectSelector from "./ProjectSelector.svelte";
</script>

<li>
  <a class="" onclick="settingsModal.showModal()">Settings</a>
</li>
<dialog id="settingsModal" class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-xl mb-4">Settings</h3>
    <div class="flex flex-col gap-4">
      {#if user}
        <div>
          <h1 class="font-bold text-lg">Project</h1>
          <ProjectSelector {user} />
        </div>
        <div>
          <h1 class="font-bold text-lg">Hotkeys</h1>
          <HotkeysSettings />
        </div>
      {/if}
      <div>
        <h1 class="font-bold text-lg">Theme</h1>
        <ThemeSelector />
      </div>
    </div>
    <div class="modal-action">
      <form method="dialog">
        <!-- if there is a button in form, it will close the modal -->
        <button class="btn">Close</button>
      </form>
    </div>
  </div>
</dialog>
