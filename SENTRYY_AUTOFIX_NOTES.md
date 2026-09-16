# Sentry autofix notes

## WEBLOGGER-T (126674651) — TypeError: Failed to fetch (weblogger.io), culprit `/logger`

No new code change. Root cause is outside the app, and the code-side mitigation is already in the repo.

- Stack frames are all `@sveltejs/kit/src/runtime/client/client.js`: `_preload_data` (hover link preload, `data-sveltekit-preload-data="hover"` in `src/app.html`) → `load_data` → `window.fetch(data_url)`. The throw is the browser's own `TypeError: Failed to fetch` on the `__data.json` request — offline, connection drop, tab/navigation aborting the request, or a proxy cutting the connection. Nothing in app code produces or can catch it: SvelteKit's client owns that fetch and routes the failure to `handleError`.
- Mitigation already committed (e0302f6, on master): `src/hooks.client.js` sets `ignoreErrors: ["Failed to fetch", "NetworkError when attempting to fetch resource", "Load failed"]`. Sentry's default event filter does substring matching on the exception value, so `"Failed to fetch (weblogger.io)"` matches and is dropped client-side.
- If events keep arriving, the deployed bundle predates e0302f6 — redeploy rather than patch. Real user-facing network failures still surface: in-app fetches handle their own errors, and chunk-load failures are handled by `src/lib/helpers/reloadOnChunkError.js`.

Verification: `npm run test -- --run` → 6 files, 26 tests passed.
