import { persisted } from "svelte-persisted-store";

const modifiers = (m = {}) => ({
  control: false,
  shift: false,
  alt: false,
  ...m,
});

const functionKeys = (m) =>
  Array.from({ length: 8 }, (_, i) => ({
    key: `F${i + 1}`,
    modifiers: modifiers(m),
  }));

// Single source of truth: the stores seed from this and the settings modal's
// "Reset hotkeys" button restores from it.
export const defaults = {
  hotkeys: functionKeys(),
  personalHotkeys: functionKeys({ shift: true }).map((h) => ({
    ...h,
    text: "",
  })),
  submitHotkey: { key: "Enter", modifiers: modifiers({ shift: true }) },
  resetHotkey: { key: "R", modifiers: modifiers({ shift: true }) },
  timecodeHotkey: { key: "T", modifiers: modifiers({ shift: true }) },
};

// First param is the local storage key, second is the initial value.
export const hotkeys = persisted("hotkeys", defaults.hotkeys);
export const personalHotkeys = persisted(
  "personalHotkeys",
  defaults.personalHotkeys
);
export const submitHotkey = persisted("submitHotkey", defaults.submitHotkey);
export const resetHotkey = persisted("resetHotkey", defaults.resetHotkey);
export const timecodeHotkey = persisted(
  "timecodeHotkey",
  defaults.timecodeHotkey
);
