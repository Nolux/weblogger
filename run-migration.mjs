// Runs the svelte-5 migration without TUI prompts
import { fileURLToPath, pathToFileURL } from 'node:url';
import glob from '/Users/aselbek/.npm/_npx/8acd29437c672435/node_modules/tiny-glob/sync.js';
import {
  update_svelte_file,
  update_js_file,
} from '/Users/aselbek/.npm/_npx/8acd29437c672435/node_modules/svelte-migrate/utils.js';
import { transform_module_code, transform_svelte_code } from '/Users/aselbek/.npm/_npx/8acd29437c672435/node_modules/svelte-migrate/migrations/svelte-5/migrate.js';
import { transform_svelte_code as transform_app_state_code } from '/Users/aselbek/.npm/_npx/8acd29437c672435/node_modules/svelte-migrate/migrations/app-state/migrate.js';

// Load migrate from the project's own svelte/compiler (Svelte 5)
const cwd = pathToFileURL(process.cwd()).href;
const { migrate } = await import('./node_modules/svelte/src/compiler/index.js');

const svelte_extensions = ['.svelte'];
const extensions = [...svelte_extensions, '.ts', '.js'];
const use_ts = false;

const folders = ['src'];

const files = folders.flatMap((folder) =>
  glob(`${folder}/**`, { filesOnly: true, dot: true })
    .map((file) => file.replace(/\\/g, '/'))
    .filter((file) => !file.includes('/node_modules/'))
);

let count = 0;
for (const file of files) {
  if (extensions.some((ext) => file.endsWith(ext))) {
    if (svelte_extensions.some((ext) => file.endsWith(ext))) {
      // SvelteKit app-state transform first
      update_svelte_file(
        file,
        (code) => code,
        (code) => transform_app_state_code(code)
      );
      // Main svelte-5 transform
      update_svelte_file(file, transform_module_code, (code) =>
        transform_svelte_code(code, migrate, { filename: file, use_ts })
      );
      console.log(`migrated: ${file}`);
      count++;
    } else {
      update_js_file(file, transform_module_code);
      console.log(`migrated js: ${file}`);
      count++;
    }
  }
}

console.log(`\nDone. Migrated ${count} files.`);
