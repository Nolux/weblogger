# WEBLOGGER-Z (Sentry 142395984) — TypeError: Cannot read properties of null (reading 'getAttribute')

No code fix applied. The crash is entirely inside the SvelteKit client runtime and is not
reachable from this codebase.

## What the stack says

All three frames are `@sveltejs/kit/src/runtime/client/client.js` (v2.62.0, `inApp: false`):

1. `client.js:2848` — the `popstate` listener: `await navigate({ type: 'popstate', ... })`
2. `client.js:1969` — inside `navigate`: `reset_focus(url, !deep_linked)`
3. `client.js:3208` — inside `reset_focus`:

```js
const root = document.body;
const tabindex = root.getAttribute('tabindex'); // <- throws
```

So `document.body` was `null` at the moment a back/forward navigation finished. Reported as
an unhandled promise rejection (`auto.browser.global_handlers.onunhandledrejection`), because
Kit's popstate listener does not catch.

## Why it is not an app bug

- No app code touches `document.body`, `document.write`, `document.open`, iframes or
  `window.open`: `grep -rn "document\." src/` returns only `document.exitFullscreen()`
  (`src/routes/live/+page.svelte:68`) and `document.documentElement.setAttribute`/`document.cookie`
  in `src/lib/components/theme/themeSelector.svelte`.
- No `{@html ...}`, no `<svelte:body>`, no manual `pushState`/`replaceState`. `src/app.html`
  has a normal `<body>` with `%sveltekit.body%` inside a plain `<div>`.
- The only history manipulation is `window.history.back()` in
  `src/routes/viewer/[logId]/+page.svelte` (lines 63 and 90), which is the ordinary
  browser-back path the trace shows — it cannot remove `<body>`.

A live document only loses its `<body>` from outside the app: an extension/content script that
rewrites `document.documentElement`, an in-app webview or translator proxy, or a
`document.open()` by injected script. That is external environment state, not runtime config
we own and not something app code can repair.

## Options if the noise matters

- Upstream: SvelteKit's `reset_focus` could null-check `document.body`. Worth an issue against
  `@sveltejs/kit`, not a local patch.
- Locally, the only levers are filters (`ignoreErrors` / `beforeSend` in `src/hooks.client.js`)
  which hide the event rather than fix it — deliberately not done here.
