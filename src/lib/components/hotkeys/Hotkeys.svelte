<script>
  import { shortcut } from "$lib/components/hotkeys/shortcut.js";
  import { hotkeys } from "$lib/stores/hotkeysStore.js";
  export let replaceBody;
</script>

<div class="w-full grid gap-2 grid-cols-2 lg:grid-cols-5 justify-around">
  {#if $hotkeys}
    {#each $hotkeys as hotkey}
      <button
        class="btn"
        use:shortcut={{
          shift: hotkey.modifiers.shift,
          control: hotkey.modifiers.control,
          alt: hotkey.modifiers.alt,
          code: hotkey.key,
        }}
        on:click={() => {
          console.log("CLICK", hotkey);
          replaceBody(hotkey.text);
        }}
      >
        <div class="flex flex-col">
          <div class="text-lg">{hotkey.text}</div>
          <div class="text-xs">
            {hotkey.modifiers.control ? "CTL + " : ""}
            {hotkey.modifiers.shift ? "SHIFT + " : ""}
            {hotkey.modifiers.alt ? "ALT + " : ""}
            {hotkey.key}
          </div>
        </div>
      </button>
    {/each}
  {/if}
</div>
