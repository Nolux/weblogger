import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),
    csrf: {
      checkOrigin: false,
    },
    version: {
      // Mobile Safari keeps tabs alive for weeks; poll so a tab opened before a
      // deploy knows its chunk hashes are dead.
      pollInterval: 60000,
    },
  },
  preprocess: vitePreprocess(),
};

export default config;
