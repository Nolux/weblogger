import { expect, test } from "vitest";
import { shouldReloadForStaleChunk } from "./staleChunkReload.js";

const fakeStorage = () => {
  const map = new Map();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, value),
  };
};

const chunkError = new TypeError(
  "Failed to fetch dynamically imported module: https://weblogger.io/_app/immutable/nodes/18.Bxz5l9Pk.js"
);

test("reloads on a failed dynamic import", () => {
  expect(shouldReloadForStaleChunk(chunkError, fakeStorage(), 1000)).toBe(true);
});

test("ignores other errors", () => {
  expect(shouldReloadForStaleChunk(new Error("boom"), fakeStorage(), 1000)).toBe(
    false
  );
});

test("does not reload twice within the cooldown", () => {
  const storage = fakeStorage();
  expect(shouldReloadForStaleChunk(chunkError, storage, 1000)).toBe(true);
  expect(shouldReloadForStaleChunk(chunkError, storage, 5000)).toBe(false);
  expect(shouldReloadForStaleChunk(chunkError, storage, 20000)).toBe(true);
});
