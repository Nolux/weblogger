// A deploy replaces the hashed chunk files, so a client that was loaded before
// it can no longer import them ("Importing a module script failed."). Vite
// dispatches a cancelable vite:preloadError for those failed imports, and a
// reload picks up the new build.
const RELOAD_KEY = "weblogger:chunkReloadedAt";
const RELOAD_COOLDOWN_MS = 10000;

export const reloadOnChunkError = () => {
  window.addEventListener("vite:preloadError", (event) => {
    const last = Number(window.sessionStorage.getItem(RELOAD_KEY) || 0);

    // Chunks are also unreachable when the network dies, where reloading would
    // loop. Try once, then let the error surface.
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return;

    window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    event.preventDefault();
    window.location.reload();
  });
};
