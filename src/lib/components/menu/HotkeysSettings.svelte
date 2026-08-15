<script>
  import {
    hotkeys,
    submitHotkey,
    resetHotkey,
    timecodeHotkey,
    personalHotkeys,
    defaults,
  } from "$lib/stores/hotkeysStore.js";

  // { id, current, set } of the row waiting for a keypress, or null
  let armed = $state(null);

  const MODIFIER_KEYS = ["Shift", "Control", "Alt", "Meta"];

  const sig = (h) =>
    `${h.modifiers.control}${h.modifiers.shift}${h.modifiers.alt}:${h.key}`;

  const display = (h) =>
    (h.modifiers.control ? "CTL + " : "") +
    (h.modifiers.shift ? "SHIFT + " : "") +
    (h.modifiers.alt ? "ALT + " : "") +
    h.key;

  let allRows = $derived([
    $submitHotkey,
    $resetHotkey,
    $timecodeHotkey,
    ...$hotkeys,
    ...$personalHotkeys,
  ]);

  let conflicts = $derived(
    new Set(allRows.map(sig).filter((s, i, a) => a.indexOf(s) !== i))
  );

  $effect(() => {
    if (!armed) return;
    const onKey = (e) => {
      e.preventDefault();
      // capture phase + stopPropagation so the shortcut action on window
      // doesn't fire the app's own hotkeys while we're binding
      e.stopPropagation();
      if (e.key === "Escape") {
        armed = null;
        return;
      }
      // ignore modifier-only presses so the user can hold them first
      if (MODIFIER_KEYS.includes(e.key)) return;
      armed.set({
        ...armed.current,
        key: e.key,
        modifiers: {
          control: e.ctrlKey || e.metaKey,
          shift: e.shiftKey,
          alt: e.altKey,
        },
      });
      armed = null;
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  });
</script>

{#snippet row(id, label, hotkey, set, withText = false)}
  <tr class={conflicts.has(sig(hotkey)) ? "bg-error/20" : ""}>
    <td>{label}</td>
    <td>
      <div class="flex items-center gap-2">
        <span
          class="tooltip tooltip-right"
          data-tip={armed?.id === id
            ? "Press the key combination you want · Esc to cancel"
            : conflicts.has(sig(hotkey))
              ? "Same combination as another hotkey · click to rebind"
              : "Click, and press the key combination you want"}
        >
          <button
            class="btn btn-xs w-32 font-mono"
            class:btn-primary={armed?.id === id}
            onclick={() => (armed = { id, current: hotkey, set })}
          >
            {armed?.id === id ? "Press key…" : display(hotkey)}
          </button>
        </span>
        {#if withText}
          <input
            class="input input-xs flex-1"
            type="text"
            placeholder="Input text"
            value={hotkey.text}
            onchange={(e) => set({ ...hotkey, text: e.currentTarget.value })}
          />
        {/if}
      </div>
    </td>
  </tr>
{/snippet}

<div class="flex flex-col gap-1">
  <table class="table table-xs table-zebra table-fixed w-full">
    <thead>
      <tr>
        <th class="w-1/3">type</th>
        <th class="w-2/3">Keybind</th>
      </tr>
    </thead>
    <tbody>
      {@render row("submit", "Submit", $submitHotkey, (v) =>
        submitHotkey.set(v)
      )}
      {@render row("reset", "Reset", $resetHotkey, (v) => resetHotkey.set(v))}
      {@render row("timecode", "Timecode", $timecodeHotkey, (v) =>
        timecodeHotkey.set(v)
      )}
      {#each $hotkeys as hotkey, i}
        {@render row(`h${i}`, `Hotkey ${i + 1}`, hotkey, (v) =>
          hotkeys.update((a) => a.map((x, j) => (j === i ? v : x)))
        )}
      {/each}
      {#each $personalHotkeys as hotkey, i}
        {@render row(
          `p${i}`,
          `Personal Hotkey ${i + 1}`,
          hotkey,
          (v) => personalHotkeys.update((a) => a.map((x, j) => (j === i ? v : x))),
          true
        )}
      {/each}
      <tr>
        <td colspan="2">
          <div class="flex items-center justify-between gap-2">
            <span
              >Click a key to rebind · Esc cancels · changes apply immediately</span
            >
            <button
              class="btn btn-xs shrink-0"
              onclick={() => {
                hotkeys.set(structuredClone(defaults.hotkeys));
                submitHotkey.set(structuredClone(defaults.submitHotkey));
                resetHotkey.set(structuredClone(defaults.resetHotkey));
                timecodeHotkey.set(structuredClone(defaults.timecodeHotkey));
                // keybinds go back to default, the user's typed text stays
                personalHotkeys.update((current) =>
                  defaults.personalHotkeys.map((d, i) => ({
                    ...structuredClone(d),
                    text: current[i]?.text ?? "",
                  }))
                );
              }}>Reset hotkeys</button
            >
          </div>
        </td>
      </tr>
    </tbody>
  </table>

  <div class="flex justify-around"></div>
</div>
