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
  // Alt on all three: these fire while the logger textarea has focus, so they
  // must not be things you can type, and Alt avoids the browser's Ctrl+T /
  // Ctrl+R. macOS rewrites Alt+letter to "®", "†", … — the matcher falls back
  // to the physical key for that.
  submitHotkey: { key: "Enter", modifiers: modifiers({ alt: true }) },
  resetHotkey: { key: "r", modifiers: modifiers({ alt: true }) },
  timecodeHotkey: { key: "t", modifiers: modifiers({ alt: true }) },
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
