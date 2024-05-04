import { persisted } from "svelte-persisted-store";

// First param `preferences` is the local storage key.
// Second param is the initial value.
export const hotkeys = persisted("hotkeys", [
  {
    key: "F1",
    modifiers: { control: true, shift: false, alt: false },
  },
  {
    key: "F2",
    modifiers: { control: true, shift: false, alt: false },
  },
  {
    key: "F3",
    modifiers: { control: true, shift: false, alt: false },
  },
  {
    key: "F4",
    modifiers: { control: true, shift: false, alt: false },
  },
  {
    key: "F5",
    modifiers: { control: true, shift: false, alt: false },
  },
  {
    key: "F6",
    modifiers: { control: true, shift: false, alt: false },
  },
  {
    key: "F7",
    modifiers: { control: true, shift: false, alt: false },
  },
  {
    key: "F8",
    modifiers: { control: true, shift: false, alt: false },
  },
]);

export const submitHotkey = persisted("submitHotkey", {
  key: "F1",
  modifiers: { control: true, shift: true, alt: false },
});

export const resetHotkey = persisted("resetHotkey", {
  key: "F2",
  modifiers: { control: true, shift: true, alt: false },
});

export const timecodeHotkey = persisted("timecodeHotkey", {
  key: "F3",
  modifiers: { control: true, shift: true, alt: false },
});
