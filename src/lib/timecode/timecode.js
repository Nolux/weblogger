import dayjs from "dayjs";

export const TIMECODE_FPS = 25;
export const FRAME_DURATION_MS = 1000 / TIMECODE_FPS;
export const MAX_FRAME = 29;
export const LOCAL_LTC_STALE_MS = 500;

export const FRAME_RATES = [
  { label: "23.976", value: 23.976 },
  { label: "24", value: 24 },
  { label: "25", value: 25 },
  { label: "29.97", value: 29.97 },
  { label: "30", value: 30 },
];

const effectiveFps = (fps) => Math.ceil(fps);

export const DEFAULT_TIMECODE_SOURCE = {
  mode: "browser-clock",
  fps: TIMECODE_FPS,
  ltcDeviceId: null,
};

export const pad2 = (value) => Number(value || 0).toString().padStart(2, "0");

export const toTimecodeString = (timecode) =>
  `${pad2(timecode.hours)}:${pad2(timecode.minutes)}:${pad2(timecode.seconds)}:${pad2(timecode.frames)}`;

export const parseTimecode = (timecodeString) => {
  const [hours, minutes, seconds, frames] = timecodeString.split(":").map((part) => parseInt(part, 10));

  return { hours, minutes, seconds, frames };
};

export const frameToLoggerTimecode = (frame) => ({
  hours: Number(frame?.hours ?? 0),
  minutes: Number(frame?.minutes ?? 0),
  seconds: Number(frame?.seconds ?? 0),
  frames: Number(frame?.frames ?? 0),
});

export const localDateFromDayjs = (value) => ({
  year: value.year(),
  month: value.month() + 1,
  day: value.date(),
});

export const dayjsWithFrameOffset = (value, offsets = {}, fps = TIMECODE_FPS) =>
  value
    .add(Number(offsets.hours || 0), "hour")
    .add(Number(offsets.minutes || 0), "minute")
    .add(Number(offsets.seconds || 0), "second")
    .add(Number(offsets.frames || 0) * (1000 / effectiveFps(fps)), "millisecond");

export const browserClockSnapshot = (value = dayjs(), offsets = {}, fps = TIMECODE_FPS) => {
  const frameDuration = 1000 / effectiveFps(fps);
  const time = dayjsWithFrameOffset(value, offsets, fps);
  const timecode = {
    hours: time.hour(),
    minutes: time.minute(),
    seconds: time.second(),
    frames: Math.floor(time.millisecond() / frameDuration),
  };

  return {
    source: "browser-clock",
    timecode,
    timecodeString: toTimecodeString(timecode),
    localDate: localDateFromDayjs(time),
    lastSeenAt: Date.now(),
  };
};

export const localLtcSnapshot = (frame, now = dayjs()) => {
  const timecode = frameToLoggerTimecode(frame);

  return {
    source: "local-ltc",
    timecode,
    timecodeString: toTimecodeString(timecode),
    localDate: localDateFromDayjs(now),
    lastSeenAt: Date.now(),
  };
};

export const isFreshLocalLtcSnapshot = (snapshot, maxAgeMs = LOCAL_LTC_STALE_MS) =>
  Boolean(snapshot?.lastSeenAt && Date.now() - snapshot.lastSeenAt <= maxAgeMs);

export const parseLocalDateString = (localDateString) => {
  const [year, month, day] = localDateString.split(/[.-]/).map((part) => parseInt(part, 10));

  return { year, month, day };
};

export const toLocalDateString = (localDate) =>
  `${localDate.year.toString().padStart(4, "0")}.${localDate.month
    .toString()
    .padStart(2, "0")}.${localDate.day.toString().padStart(2, "0")}`;

export const timecodeToDate = (localDate, timecode) =>
  new Date(
    dayjs()
      .set("year", localDate.year)
      .set("month", localDate.month - 1)
      .set("date", localDate.day)
      .set("hour", timecode.hours)
      .set("minute", timecode.minutes)
      .set("second", timecode.seconds)
      .set("millisecond", timecode.frames * FRAME_DURATION_MS)
      .format("YYYY-MM-DDTHH:mm:ss.SSS"),
  );

export const timecodeToDayjs = (localDate, timecode) => dayjs(timecodeToDate(localDate, timecode));
