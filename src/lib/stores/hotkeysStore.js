import { persisted } from "svelte-persisted-store";

// First param `preferences` is the local storage key.
// Second param is the initial value.
export const hotkeys = persisted("hotkeys", [
  {
    key: "F1",
    modifiers: { control: false, shift: false, alt: true },
  },
  {
    key: "F2",
    modifiers: { control: false, shift: false, alt: true },
  },
  {
    key: "F3",
    modifiers: { control: false, shift: false, alt: true },
  },
  {
    key: "F4",
    modifiers: { control: false, shift: false, alt: true },
  },
  {
    key: "F5",
    modifiers: { control: false, shift: false, alt: true },
  },
  {
    key: "F6",
    modifiers: { control: false, shift: false, alt: true },
  },
  {
    key: "F7",
    modifiers: { control: false, shift: false, alt: true },
  },
  {
    key: "F8",
    modifiers: { control: false, shift: false, alt: true },
  },
]);

export const personalHotkeys = persisted("personalHotkeys", [
  {
    key: "F1",
    modifiers: { control: false, shift: false, alt: false },
    text: "",
  },
  {
    key: "F2",
    modifiers: { control: false, shift: false, alt: false },
    text: "",
  },
  {
    key: "F3",
    modifiers: { control: false, shift: false, alt: false },
    text: "",
  },
  {
    key: "F4",
    modifiers: { control: false, shift: false, alt: false },
    text: "",
  },
  {
    key: "F5",
    modifiers: { control: false, shift: false, alt: false },
    text: "",
  },
  {
    key: "F6",
    modifiers: { control: false, shift: false, alt: false },
    text: "",
  },
  {
    key: "F7",
    modifiers: { control: false, shift: false, alt: false },
    text: "",
  },
  {
    key: "F8",
    modifiers: { control: false, shift: false, alt: false },
    text: "",
  },
]);

export const submitHotkey = persisted("submitHotkey", {
  key: "F1",
  modifiers: { control: false, shift: true, alt: false },
});

export const resetHotkey = persisted("resetHotkey", {
  key: "F2",
  modifiers: { control: false, shift: true, alt: false },
});

export const timecodeHotkey = persisted("timecodeHotkey", {
  key: "F3",
  modifiers: { control: false, shift: true, alt: false },
});
