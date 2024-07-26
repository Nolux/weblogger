<script>
  import {
    hotkeys,
    submitHotkey,
    resetHotkey,
    timecodeHotkey,
  } from "$lib/stores/hotkeysStore.js";
</script>

<div class="flex flex-col gap-1">
  <table class="table table-xs table-striped w-full">
    <thead>
      <tr>
        <th>type</th>
        <th>Button</th>
        <th>Controll</th>
        <th>Shift</th>
        <th>Alt</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Submit</td>
        <td>
          <input
            class="input input-xs w-16 input-bordered"
            type="text"
            bind:value={$submitHotkey.key}
          />
        </td>
        <td
          ><input
            class="toggle toggle-xs"
            type="checkbox"
            bind:checked={$submitHotkey.modifiers.control}
          /></td
        >
        <td
          ><input
            class="toggle toggle-xs"
            type="checkbox"
            bind:checked={$submitHotkey.modifiers.shift}
          /></td
        >
        <td
          ><input
            class="toggle toggle-xs"
            type="checkbox"
            bind:checked={$submitHotkey.modifiers.alt}
          /></td
        >
      </tr>
      <tr>
        <td>Reset</td>
        <td>
          <input
            class="input input-xs w-16 input-bordered"
            type="text"
            bind:value={$resetHotkey.key}
          />
        </td>
        <td
          ><input
            class="toggle toggle-xs"
            type="checkbox"
            bind:checked={$resetHotkey.modifiers.control}
          /></td
        >
        <td
          ><input
            class="toggle toggle-xs"
            type="checkbox"
            bind:checked={$resetHotkey.modifiers.shift}
          /></td
        >
        <td
          ><input
            class="toggle toggle-xs"
            type="checkbox"
            bind:checked={$resetHotkey.modifiers.alt}
          /></td
        >
      </tr>
      <tr>
        <td>Timecode</td>
        <td>
          <input
            class="input input-xs w-16 input-bordered"
            type="text"
            bind:value={$timecodeHotkey.key}
          />
        </td>
        <td
          ><input
            class="toggle toggle-xs"
            type="checkbox"
            bind:checked={$timecodeHotkey.modifiers.control}
          /></td
        >
        <td
          ><input
            class="toggle toggle-xs"
            type="checkbox"
            bind:checked={$timecodeHotkey.modifiers.shift}
          /></td
        >
        <td
          ><input
            class="toggle toggle-xs"
            type="checkbox"
            bind:checked={$timecodeHotkey.modifiers.alt}
          /></td
        >
      </tr>
      {#each $hotkeys as hotkey, i}
        <tr>
          <td>Hotkey {i + 1}</td>
          <td>
            <input
              class="input input-xs w-16 input-bordered"
              type="text"
              bind:value={hotkey.key}
            />
          </td>
          <td
            ><input
              class="toggle toggle-xs"
              type="checkbox"
              bind:checked={hotkey.modifiers.control}
            /></td
          >
          <td
            ><input
              class="toggle toggle-xs"
              type="checkbox"
              bind:checked={hotkey.modifiers.shift}
            /></td
          >
          <td
            ><input
              class="toggle toggle-xs"
              type="checkbox"
              bind:checked={hotkey.modifiers.alt}
            /></td
          >
        </tr>
      {/each}
      <tr
        ><td colspan="2" class="text-center"
          >Save or refresh to update hotkeys</td
        >
        <td
          ><button
            class="btn btn-xs"
            on:click={() => {
              window.location.reload();
            }}>Save</button
          >
        </td>
        <td
          ><button
            class="btn btn-xs"
            on:click={() => {
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
