<script>
  import { shortcut } from "$lib/components/hotkeys/shortcut.js";
  import { hotkeys } from "$lib/stores/hotkeysStore.js";
  export let replaceBody;
  export let markerColors = [];
</script>

<div class={`w-full grid gap-2 grid-cols-2 lg:grid-cols-8 justify-around`}>
  {#if $hotkeys}
    {#each $hotkeys as hotkey, i}
      {#if markerColors[i]}
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
            replaceBody(markerColors[i].text);
          }}
        >
          <div class="flex flex-col">
            <div class="text-lg">{markerColors[i].text}</div>
            <div class="text-xs">
              {hotkey.modifiers.control ? "CTL + " : ""}
              {hotkey.modifiers.shift ? "SHIFT + " : ""}
              {hotkey.modifiers.alt ? "ALT + " : ""}
              {hotkey.key}
            </div>
          </div>
        </button>
      {/if}
    {/each}
  {/if}
</div>
