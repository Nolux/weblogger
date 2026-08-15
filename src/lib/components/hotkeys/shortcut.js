export const shortcut = (node, params) => {
  // params is read at event time, so `update` only has to swap the reference —
  // no listener churn, and rebound hotkeys take effect immediately.
  const handler = (e) => {
    if (!params) return;
    if (
      !!params.alt != e.altKey ||
      !!params.shift != e.shiftKey ||
      !!params.control != (e.ctrlKey || e.metaKey) ||
      params.code != e.key
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
