<script>
  import {
    hotkeys,
    submitHotkey,
    resetHotkey,
    timecodeHotkey,
    personalHotkeys,
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
  <tr
    class={conflicts.has(sig(hotkey)) ? "bg-error/20" : ""}
    title={conflicts.has(sig(hotkey))
      ? "Same combination as another hotkey"
      : ""}
  >
    <td>{label}</td>
    <td>
      <button
        class="btn btn-xs w-32 font-mono"
        class:btn-primary={armed?.id === id}
        onclick={() => (armed = { id, current: hotkey, set })}
      >
        {armed?.id === id ? "Press key…" : display(hotkey)}
      </button>
    </td>
    <td>
      {#if withText}
        <input
          class="input input-xs w-16"
          type="text"
          value={hotkey.text}
          onchange={(e) => set({ ...hotkey, text: e.currentTarget.value })}
        />
      {/if}
    </td>
    {#each ["control", "shift", "alt"] as modifier}
      <td>
        <input
          class="toggle toggle-xs"
          type="checkbox"
          checked={hotkey.modifiers[modifier]}
          onchange={(e) =>
            set({
              ...hotkey,
              modifiers: {
                ...hotkey.modifiers,
                [modifier]: e.currentTarget.checked,
              },
            })}
        />
      </td>
    {/each}
  </tr>
{/snippet}

<div class="flex flex-col gap-1">
  <table class="table table-xs table-zebra w-full">
    <thead>
      <tr>
        <th>type</th>
        <th>Button</th>
        <th>opt</th>
        <th>Control</th>
        <th>Shift</th>
        <th>Alt</th>
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
      <tr
        ><td colspan="2" class="text-center"
          >Click a key to rebind · Esc cancels · Save or refresh to update
          hotkeys</td
        >
        <td
          ><button
            class="btn btn-xs"
            onclick={() => {
              window.location.reload();
            }}>Save</button
          >
        </td>
        <td
          ><button
            class="btn btn-xs"
            onclick={() => {
              hotkeys.set([
                {
                  key: "F1",
                  modifiers: { control: false, shift: false, alt: false },
                },
                {
                  key: "F2",
                  modifiers: { control: false, shift: false, alt: false },
                },
                {
                  key: "F3",
                  modifiers: { control: false, shift: false, alt: false },
                },
                {
                  key: "F4",
                  modifiers: { control: false, shift: false, alt: false },
                },
                {
                  key: "F5",
                  modifiers: { control: false, shift: false, alt: false },
                },
                {
                  key: "F6",
                  modifiers: { control: false, shift: false, alt: false },
                },
                {
                  key: "F7",
                  modifiers: { control: false, shift: false, alt: false },
                },
                {
                  key: "F8",
                  modifiers: { control: false, shift: false, alt: false },
                },
              ]);
              submitHotkey.set({
                key: "F1",
                modifiers: { control: false, shift: true, alt: false },
              });

              resetHotkey.set({
                key: "F2",
                modifiers: { control: false, shift: true, alt: false },
              });

              timecodeHotkey.set({
                key: "F3",
                modifiers: { control: false, shift: true, alt: false },
              });
            }}>Reset hotkeys</button
          ></td
        >
      </tr>
    </tbody>
  </table>

  <div class="flex justify-around"></div>
</div>
