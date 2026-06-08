import { writable } from "svelte/store";
import { Decoder } from "linear-timecode";
import { LOCAL_LTC_STALE_MS, TIMECODE_FPS, localLtcSnapshot } from "$lib/timecode/timecode.js";

const initialState = {
  status: "idle",
  devices: [],
  selectedDeviceId: null,
  deviceLabel: "",
  snapshot: null,
  timecode: null,
  timecodeString: "--:--:--:--",
  lastSeenAt: null,
  level: 0,
  error: null,
};

export const localLtcState = writable(initialState);

let audioContext;
let mediaStream;
let processor;
let decoder;
let staleTimer;

const update = (patch) => localLtcState.update((state) => ({ ...state, ...patch }));

const stopStream = () => {
  if (processor) {
    processor.disconnect();
    processor.onaudioprocess = null;
    processor = null;
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  if (staleTimer) {
    clearInterval(staleTimer);
    staleTimer = null;
  }
};

export const listLocalLtcDevices = async () => {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
    update({ status: "error", error: "Audio input devices are not available in this browser." });
    return [];
  }

  const devices = (await navigator.mediaDevices.enumerateDevices()).filter(
    (device) => device.kind === "audioinput",
  );

  update({ devices });
  return devices;
};

const attachDecoder = (sampleRate) => {
  decoder = new Decoder(sampleRate);
  decoder.on("frame", (frame) => {
    const snapshot = localLtcSnapshot(frame);
    update({
      status: "locked",
      snapshot,
      timecode: snapshot.timecode,
      timecodeString: snapshot.timecodeString,
      lastSeenAt: snapshot.lastSeenAt,
      error: null,
    });
  });
};

export const connectLocalLtc = async (deviceId = null) => {
  stopStream();

  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    update({ status: "error", error: "Local LTC requires browser microphone/audio-input access." });
    return;
  }

  update({ status: "permission-needed", selectedDeviceId: deviceId, error: null });

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
      video: false,
    });

    if (typeof window === "undefined") {
      throw new Error("Local LTC can only be connected in a browser.");
    }

    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextConstructor();
    attachDecoder(audioContext.sampleRate);

    const source = audioContext.createMediaStreamSource(mediaStream);
    processor = audioContext.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = (event) => {
      const samples = Array.from(event.inputBuffer.getChannelData(0));
      decoder.decode(samples);
      const rms = Math.sqrt(samples.reduce((sum, s) => sum + s * s, 0) / samples.length);
      update({ level: Math.min(1, rms * 4) });
    };

    source.connect(processor);
    processor.connect(audioContext.destination);

    const [track] = mediaStream.getAudioTracks();
    update({
      status: "listening",
      selectedDeviceId: deviceId,
      deviceLabel: track?.label || "Selected audio input",
      error: null,
    });

    await listLocalLtcDevices();

    staleTimer = setInterval(() => {
      localLtcState.update((state) => {
        if (state.status !== "locked" || !state.lastSeenAt) return state;
        if (Date.now() - state.lastSeenAt <= LOCAL_LTC_STALE_MS) return state;

        return { ...state, status: "unlocked" };
      });
    }, LOCAL_LTC_STALE_MS);
  } catch (error) {
    stopStream();
    update({ status: "error", error: error.message || "Could not connect to local LTC input." });
  }
};

export const disconnectLocalLtc = () => {
  stopStream();
  update({
    status: "idle",
    snapshot: null,
    timecode: null,
    timecodeString: "--:--:--:--",
    lastSeenAt: null,
    level: 0,
    error: null,
  });
};

export const ingestLocalLtcFrame = (frame) => {
  const snapshot = localLtcSnapshot({ ...frame, framerate: frame.framerate || TIMECODE_FPS });
  update({
    status: "locked",
    snapshot,
    timecode: snapshot.timecode,
    timecodeString: snapshot.timecodeString,
    lastSeenAt: snapshot.lastSeenAt,
    error: null,
  });
};
