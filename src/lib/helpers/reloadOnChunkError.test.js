import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { reloadOnChunkError } from "./reloadOnChunkError.js";

// ponytail: hand-rolled window stub instead of pulling in jsdom for one test
let listeners;
let reloads;
let store;

const fire = () => {
  const event = { defaultPrevented: false, preventDefault() {
    this.defaultPrevented = true;
  } };
  listeners.forEach((l) => l(event));
  return event;
};

beforeEach(() => {
  listeners = [];
  reloads = 0;
  store = new Map();
  globalThis.window = {
    addEventListener: (type, handler) => {
      expect(type).toBe("vite:preloadError");
      listeners.push(handler);
    },
    location: { reload: () => reloads++ },
    sessionStorage: {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => store.set(k, v),
    },
  };
  reloadOnChunkError();
});

afterEach(() => {
  delete globalThis.window;
});

describe("reloadOnChunkError", () => {
  it("reloads and swallows the error on a failed chunk import", () => {
    const event = fire();

    expect(reloads).toBe(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it("only reloads once, so an offline client does not loop", () => {
    fire();
    const second = fire();

    expect(reloads).toBe(1);
    expect(second.defaultPrevented).toBe(false);
  });
});
