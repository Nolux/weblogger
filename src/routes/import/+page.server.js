import { fail } from "@sveltejs/kit";
import dayjs from "dayjs";

function parseTimecode(timecode) {
  const splitTimecode = timecode?.split(":");
  return {
    hours: parseInt(splitTimecode[0]),
    minutes: parseInt(splitTimecode[1]),
    seconds: parseInt(splitTimecode[2]),
    frames: parseInt(splitTimecode[3]),
  };
}

function parseAvidScript(lines, localDateString) {
  let scriptLogs = [];
  console.log(lines[3]);
  const date = dayjs(localDateString);

  for (let i = 3; i < lines.length; ) {
    try {
      // console.log(lines[i]);
      // console.log(lines[i + 1]);
      // console.log(lines[i + 2]);
      if (!lines[i] || !lines[i + 1] || !lines[i + 2]) break;
      let time = lines[i + 1].split(" - ")[0];
      let timecode = parseTimecode(time);
      let marker = lines[i]?.replace(/[\t\r\n]/g, "");

      scriptLogs.push({
        marker,
        timecode,
        localDate: {
          year: date.year(),
          month: date.month() + 1,
          day: date.date(),
        },
        timecodeString: time,
        timecodeDateObj: date
          .add(timecode.hours, "h")
          .add(timecode.minutes, "m")
          .add(timecode.seconds, "s")
          .add(timecode.frames * 40, "ms")
          .format("YYYY-MM-DD[T]HH:mm:ss.SSSZ"),
        vlayer: "V1",
        color: "black",
        body: `${marker} ${lines[i + 2]?.replace(/[\t\b\n]/g, "")}`,
      });
    } catch (err) {
      console.log(err);
      return;
    }
    i = i + 4;
  }
  console.log(scriptLogs[0]);
  return { logs: scriptLogs, localDateString: localDateString };
}

export const actions = {
  uploadFile: async ({ request }) => {
    const formData = Object.fromEntries(await request.formData());

    if (!formData.file || formData.file === "undefined") {
      return fail(400, {
        error: true,

        message: "You must provide a file to upload",
      });
    }

    const file = formData.file;
    const fileType = formData.fileType;
    const localDate = formData.localDate;

    console.log(fileType);

    const date = dayjs(localDate);

    const bytes = new Uint8Array(await file.arrayBuffer());
    const newfile = new Blob([bytes], { type: file.type });

    const rawText = await newfile.text();
    const lines = rawText.split("\n");

    switch (fileType) {
      case "avid-marker":
        let markerLogs = lines
          .map((line) => {
            try {
              const log = line.split("\t");
              const splitTimecode = log[1]?.split(":");
              const timecode = {
                hours: parseInt(splitTimecode[0]),
                minutes: parseInt(splitTimecode[1]),
                seconds: parseInt(splitTimecode[2]),
                frames: parseInt(splitTimecode[3]),
              };
              if (!log || !splitTimecode) {
                return;
              }
              return {
                marker: log[0],
                timecode,
                localDate: {
                  year: date.year(),
                  month: date.month() + 1,
                  day: date.date(),
                },
                timecodeString: log[1],
                timecodeDateObj: date
                  .add(timecode.hours, "h")
                  .add(timecode.minutes, "m")
                  .add(timecode.seconds, "s")
                  .add(timecode.frames * 40, "ms")
                  .format("YYYY-MM-DD[T]HH:mm:ss.SSSZ"),
                vlayer: log[2],
                color: log[3],
                body: log[4],
              };
            } catch (err) {
              return null;
            }
          })
          .filter(Boolean);

        return { logs: markerLogs, localDateString: localDate };
      case "avid-script":
        let data = parseAvidScript(lines, localDate);

        return { logs: data.logs, localDateString: data.localDateString };

        break;
      case "avid-subcap":
        break;
    }
  },
};
