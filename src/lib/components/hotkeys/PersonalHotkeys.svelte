<script>
  import { shortcut, display } from "$lib/components/hotkeys/shortcut.js";
  import { personalHotkeys } from "$lib/stores/hotkeysStore.js";
  let { replaceBody, inTimecode, setTimecodeToNow } = $props();
</script>

<div class={`w-full grid gap-2 grid-cols-4 lg:grid-cols-8 justify-around`}>
  {#if $personalHotkeys}
    {#each $personalHotkeys as hotkey, i}
      {#if hotkey.text}
        <button
          class="py-6 btn lg:btn-lg"
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
            replaceBody(hotkey.text + " ");
          }}
        >
          <div class="flex flex-col">
            <div class="lg:text-lg">{hotkey.text}</div>
            <div class="text-xs">{display(hotkey)}</div>
          </div>
        </button>
      {/if}
    {/each}
  {/if}
</div>
