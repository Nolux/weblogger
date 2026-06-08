import { describe, expect, test, vi } from "vitest";
import dayjs from "dayjs";

import {
  DEFAULT_TIMECODE_SOURCE,
  MAX_FRAME,
  browserClockSnapshot,
  frameToLoggerTimecode,
  isFreshLocalLtcSnapshot,
  parseTimecode,
  timecodeToDate,
  toTimecodeString,
} from "./timecode.js";

describe("timecode utilities", () => {
  test("formats and parses 25fps timecode consistently", () => {
    const tc = { hours: 1, minutes: 2, seconds: 3, frames: 4 };

    expect(toTimecodeString(tc)).toBe("01:02:03:04");
    expect(parseTimecode("01:02:03:04")).toEqual(tc);
    expect(MAX_FRAME).toBe(24);
  });

  test("uses frame offsets when creating browser-clock snapshots", () => {
    const snapshot = browserClockSnapshot(dayjs("2026-06-08T12:00:00.000"), {
      hours: 0,
      minutes: 0,
      seconds: 0,
      frames: 7,
    });

    expect(snapshot.timecodeString).toBe("12:00:00:07");
    expect(snapshot.timecode).toEqual({ hours: 12, minutes: 0, seconds: 0, frames: 7 });
    expect(snapshot.localDate).toEqual({ year: 2026, month: 6, day: 8 });
  });

  test("rolls frame offsets across seconds at 25fps", () => {
    const snapshot = browserClockSnapshot(dayjs("2026-06-08T12:00:00.960"), {
      hours: 0,
      minutes: 0,
      seconds: 0,
      frames: 2,
    });

    expect(snapshot.timecodeString).toBe("12:00:01:01");
  });

  test("converts stored local date and timecode to sortable Date", () => {
    expect(
      timecodeToDate(
        { year: 2026, month: 6, day: 8 },
        { hours: 1, minutes: 2, seconds: 3, frames: 4 },
      ).toISOString(),
    ).toBe(new Date("2026-06-08T01:02:03.160").toISOString());
  });

  test("normalizes frames emitted by the LTC decoder into logger timecode", () => {
    expect(frameToLoggerTimecode({ hours: 1, minutes: 2, seconds: 3, frames: 4 })).toEqual({
      hours: 1,
      minutes: 2,
      seconds: 3,
      frames: 4,
    });
  });

  test("rejects stale local LTC snapshots", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-08T12:00:01.000Z"));

    expect(isFreshLocalLtcSnapshot({ lastSeenAt: Date.now() - 250 })).toBe(true);
    expect(isFreshLocalLtcSnapshot({ lastSeenAt: Date.now() - 750 })).toBe(false);
    expect(isFreshLocalLtcSnapshot(null)).toBe(false);

    vi.useRealTimers();
  });

  test("keeps browser clock as the default source and supports local LTC selection", () => {
    expect(DEFAULT_TIMECODE_SOURCE).toEqual({
      mode: "browser-clock",
      fps: 25,
      ltcDeviceId: null,
    });
  });
});
