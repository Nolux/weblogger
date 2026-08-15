import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { shortcut } from "./shortcut.js";

// ponytail: hand-rolled window stub instead of pulling in jsdom for one test
let listeners;
const fakeEvent = (key, mods = {}) => ({
  key,
  altKey: !!mods.alt,
  shiftKey: !!mods.shift,
  ctrlKey: !!mods.control,
  metaKey: !!mods.meta,
  preventDefault() {},
});
const press = (key, mods) => listeners.forEach((l) => l(fakeEvent(key, mods)));

beforeEach(() => {
  listeners = [];
  globalThis.window = {
    addEventListener: (_, h) => listeners.push(h),
    removeEventListener: (_, h) =>
      listeners.splice(listeners.indexOf(h) >>> 0, 1),
  };
});

afterEach(() => {
  delete globalThis.window;
});

describe("shortcut", () => {
  it("fires the callback on an exact key + modifier match", () => {
    let fired = 0;
    shortcut({}, { code: "F1", shift: true, callback: () => fired++ });

    press("F1", { shift: true });
    expect(fired).toBe(1);

    press("F1"); // missing shift
    press("F2", { shift: true }); // wrong key
    press("F1", { shift: true, alt: true }); // extra modifier
    expect(fired).toBe(1);
  });

  it("treats meta as control, so Cmd works on macOS", () => {
    let fired = 0;
    shortcut({}, { code: "k", control: true, callback: () => fired++ });

    press("k", { meta: true });
    expect(fired).toBe(1);
  });

  it("honours rebinding via update", () => {
    let fired = 0;
    const { update } = shortcut(
      {},
      { code: "F1", callback: () => fired++ }
    );

    update({ code: "F4", alt: true, callback: () => fired++ });

    press("F1"); // old binding must be dead
    expect(fired).toBe(0);

    press("F4", { alt: true });
    expect(fired).toBe(1);
  });

  it("clicks the node when no callback is given", () => {
    let clicks = 0;
    shortcut({ click: () => clicks++ }, { code: "F1" });

    press("F1");
    expect(clicks).toBe(1);
  });

  it("stops listening after destroy", () => {
    let fired = 0;
    const { destroy } = shortcut({}, { code: "F1", callback: () => fired++ });

    destroy();
    press("F1");
    expect(fired).toBe(0);
    expect(listeners).toHaveLength(0);
  });
});
