import { get } from "svelte/store";
import { describe, expect, test, vi, afterEach } from "vitest";
import { Encoder, Frame } from "linear-timecode";

import {
  connectLocalLtc,
  disconnectLocalLtc,
  ingestLocalLtcFrame,
  listLocalLtcDevices,
  localLtcState,
} from "./ltcClient.js";

describe("local LTC client", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    disconnectLocalLtc();
  });

  test("ingests a local LTC frame into logger timecode state", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-08T12:34:56.000Z"));

    ingestLocalLtcFrame({ hours: 9, minutes: 8, seconds: 7, frames: 6, framerate: 25 });

    expect(get(localLtcState)).toMatchObject({
      status: "locked",
      timecode: { hours: 9, minutes: 8, seconds: 7, frames: 6 },
      timecodeString: "09:08:07:06",
      lastSeenAt: Date.now(),
      error: null,
    });
  });

  test("defaults missing LTC framerate to the project 25fps timecode rate", () => {
    ingestLocalLtcFrame({ hours: 1, minutes: 2, seconds: 3, frames: 4 });

    expect(get(localLtcState)).toMatchObject({
      status: "locked",
      timecodeString: "01:02:03:04",
      timecode: { hours: 1, minutes: 2, seconds: 3, frames: 4 },
    });
  });

  test("disconnect resets local LTC state without changing browser-clock defaults", async () => {
    ingestLocalLtcFrame({ hours: 1, minutes: 2, seconds: 3, frames: 4 });

    disconnectLocalLtc();

    expect(get(localLtcState)).toMatchObject({
      status: "idle",
      snapshot: null,
      timecode: null,
      timecodeString: "--:--:--:--",
      lastSeenAt: null,
      error: null,
    });
  });

  test("lists audio input devices and ignores non-audio sources", async () => {
    vi.stubGlobal("navigator", {
      mediaDevices: {
        enumerateDevices: vi.fn().mockResolvedValue([
          { kind: "audioinput", deviceId: "ltc-1", label: "LTC interface" },
          { kind: "videoinput", deviceId: "camera-1", label: "Camera" },
        ]),
      },
    });

    const devices = await listLocalLtcDevices();

    expect(devices).toEqual([{ kind: "audioinput", deviceId: "ltc-1", label: "LTC interface" }]);
    expect(get(localLtcState).devices).toEqual(devices);
  });

  test("connects to browser audio input and decodes encoded LTC samples", async () => {
    let processor;
    const stream = {
      getTracks: () => [{ stop: vi.fn() }],
      getAudioTracks: () => [{ label: "LTC interface" }],
    };

    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(stream),
        enumerateDevices: vi.fn().mockResolvedValue([
          { kind: "audioinput", deviceId: "ltc-1", label: "LTC interface" },
        ]),
      },
    });
    vi.stubGlobal("window", {
      AudioContext: class {
        sampleRate = 48000;
        destination = {};
        createMediaStreamSource() {
          return { connect: vi.fn() };
        }
        createScriptProcessor() {
          processor = { connect: vi.fn(), disconnect: vi.fn(), onaudioprocess: null };
          return processor;
        }
        close() {}
      },
    });

    await connectLocalLtc("ltc-1");

    expect(get(localLtcState)).toMatchObject({
      status: "listening",
      selectedDeviceId: "ltc-1",
      deviceLabel: "LTC interface",
    });

    const frame = new Frame(25);
    frame.hours = 9;
    frame.minutes = 8;
    frame.seconds = 7;
    frame.frames = 6;
    const samples = Array.from(new Encoder(48000).encode(frame)).map((sample) => sample / 127);

    processor.onaudioprocess({
      inputBuffer: {
        getChannelData: () => Float32Array.from(samples),
      },
    });
    processor.onaudioprocess({
      inputBuffer: {
        getChannelData: () => Float32Array.from(samples),
      },
    });

    expect(get(localLtcState)).toMatchObject({
      status: "locked",
      timecode: { hours: 9, minutes: 8, seconds: 7, frames: 6 },
      timecodeString: "09:08:07:06",
      error: null,
    });
  });
});
