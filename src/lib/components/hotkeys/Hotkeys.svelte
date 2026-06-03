<script>
  import { shortcut } from "$lib/components/hotkeys/shortcut.js";
  import { hotkeys } from "$lib/stores/hotkeysStore.js";
  let {
    replaceBody,
    markerColors = [],
    inTimecode,
    setTimecodeToNow,
  } = $props();
</script>

<div class={`w-full grid gap-2 grid-cols-4 lg:grid-cols-8 justify-around`}>
  {#if $hotkeys}
    {#each $hotkeys as hotkey, i}
      {#if markerColors[i]}
        <button
          class="py-8 btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl"
          use:shortcut={{
            shift: hotkey.modifiers.shift,
            control: hotkey.modifiers.control,
            alt: hotkey.modifiers.alt,
            code: hotkey.key,
          }}
          onclick={() => {
            if (inTimecode == "XX:XX:XX:XX") {
              setTimecodeToNow();
            }
            replaceBody(markerColors[i].text + " ");
          }}
        >
          <div class="flex flex-col">
            <div class="lg:text-lg">{markerColors[i].text}</div>
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
