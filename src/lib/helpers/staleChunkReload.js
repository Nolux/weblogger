// A deploy replaces the hashed chunks under /_app/immutable, so a tab left open
// across a deploy fails to import the route it navigates to. SvelteKit reloads
// on its own when its version check confirms the deploy, but that check returns
// false when version.json is cached or the request fails, and the user is left
// on an error page. Reload instead, at most once per 10s so a chunk that stays
// missing can't spin the tab in a reload loop.
const RELOAD_KEY = "weblogger:staleChunkReload";
const RELOAD_COOLDOWN_MS = 10000;

export const shouldReloadForStaleChunk = (error, storage, now = Date.now()) => {
  if (!/dynamically imported module/i.test(error?.message ?? "")) return false;

  const lastAttempt = Number(storage?.getItem(RELOAD_KEY));
  if (lastAttempt && now - lastAttempt < RELOAD_COOLDOWN_MS) return false;

  storage?.setItem(RELOAD_KEY, String(now));
  return true;
};
