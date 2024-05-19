import { fail, json } from "@sveltejs/kit";
import dayjs from "dayjs";

export const POST = async ({ request, url }) => {
  const localDate = url.searchParams.get("localdate");
  const date = dayjs(localDate);

  const data = Object.fromEntries(await request.formData());

  console.log(data);
  const file = data.file;

  console.log(file);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const newfile = new Blob([bytes], { type: file.type });

  const rawText = await newfile.text();
  const lines = rawText.split("\n");

  let logs = lines
    .map((line) => {
      const log = line.split("\t");
      const splitTimecode = log[1]?.split(":");
      if (!log || !splitTimecode) {
        return;
      }
      return {
        marker: log[0],
        timecode: {
          hours: parseInt(splitTimecode[0]),
          minutes: parseInt(splitTimecode[1]),
          seconds: parseInt(splitTimecode[2]),
          frames: parseInt(splitTimecode[3]),
        },
        localDate: {
          year: date.year(),
          month: date.month() + 1,
          day: date.date(),
        },
        timecodeString: log[1],
        vlayer: log[2],
        color: log[3],
        body: log[4],
      };
    })
    .filter(Boolean);

  console.log(logs);

  return json({ logs, localDateString: localDate });
};
