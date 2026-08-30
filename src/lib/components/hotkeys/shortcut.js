// What to store when binding a key. event.key is the *typed* character, so
// Shift+1 reads "!" and macOS Alt+R reads "®" — bind the physical key instead
// and the label stays "1" / "R" whatever the modifiers do to it.
export const keyFromEvent = (e) =>
  /^(Key|Digit)./.test(e.code)
    ? e.code.replace(/^(Key|Digit)/, "").toLowerCase()
    : e.key;

// Label for a stored binding, e.g. "ALT + R". Physical keys are stored
// lowercase, so single characters are uppercased for display.
export const display = (h) =>
  (h.modifiers.control ? "CTL + " : "") +
  (h.modifiers.shift ? "SHIFT + " : "") +
  (h.modifiers.alt ? "ALT + " : "") +
  (h.key === " " ? "Space" : h.key.toUpperCase());

// Bindings are stored as the physical key, but event.key still carries the
// typed character, so single-character bindings match on either.
const matchesKey = (e, code) =>
  code == e.key ||
  (code?.length === 1 &&
    (e.code === `Key${code.toUpperCase()}` || e.code === `Digit${code}`));

export const shortcut = (node, params) => {
  // params is read at event time, so `update` only has to swap the reference —
  // no listener churn, and rebound hotkeys take effect immediately.
  const handler = (e) => {
    if (!params) return;
    if (
      !!params.alt != e.altKey ||
      !!params.shift != e.shiftKey ||
      !!params.control != (e.ctrlKey || e.metaKey) ||
      !matchesKey(e, params.code)
    )
      return;
    e.preventDefault();
    params.callback ? params.callback() : node.click();
  };
  window.addEventListener("keydown", handler);
  return {
    update: (newParams) => (params = newParams),
    destroy: () => window.removeEventListener("keydown", handler),
  };
};
