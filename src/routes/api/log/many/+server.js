import { json, error } from "@sveltejs/kit";
import { db } from "$lib/db.js";
import { LogModel } from "$lib/Models/Log.js";
import { timecodeToDayjs, toLocalDateString, toTimecodeString } from "$lib/timecode/timecode.js";

export const POST = async ({ request, locals }) => {
  let { logs, localDateString } = await request.json();

  const user = locals.user;
  const projectId = user.selectedProjectId;

  console.log(projectId);

  if (logs.length < 1 || !projectId) {
    return error(400, "Missing input");
  }

  logs = logs.map((log) => {
    // Look for capital words and marker words ending with:
    const tags = log.body.match(/\b[A-Z0-9]{2,}\b/g) || [];
    let marker = log.body.match(/\b[A-Z0-9]{1,}\b:/);
    let shortMarkers = log.body.match(/\b[A-Z0-9]{1,}\b:/g);
    if (marker) {
      marker = marker[0];
      tags[tags.indexOf(marker.split(":")[0])] = marker;
    }
    if (marker && !tags.includes(marker)) {
      tags.unshift(...shortMarkers);
    }

    // Check for duplicate tags
    const uniqueTags = tags?.filter(
      (item, index) => tags.indexOf(item) === index
    );

    // Create localdate obj

    const localDateString = toLocalDateString(log.localDate);

    // Create timecode obj
    const timecodeString = toTimecodeString(log.timecode);

    const timecodeDateObj = timecodeToDayjs(log.localDate, log.timecode);

    const logObj = {
      body: log.body,
      tags: uniqueTags ? uniqueTags : [],
      marker: log.marker,
      timecode: log.timecode,
      timecodeString,
      timecodeDateObj: timecodeDateObj.format("YYYY-MM-DD[T]HH:mm:ss.SSSZ"),
      timezone: timecodeDateObj.format("Z"),
      localDate: log.localDate,
      localDateString,
      createdById: user.id,
      createdByFullName: user.fullName,
      projectId: projectId,
    };

    console.log(logObj);

    const result = LogModel.safeParse(logObj);

    if (!result.success) {
      console.log(result.error.format());

      return;
    }

    return logObj;
  });

  // Check if project has this day?
  const project = await db.project.findUnique({
    where: { id: projectId, projectDays: { has: localDateString } },
  });

  if (!project) {
    await db.project.update({
      where: { id: projectId },
      data: { projectDays: { push: localDateString } },
    });
  }

  // Write to db
  const returnedLogs = await db.log.createMany({
    data: logs,
  });

  return json(returnedLogs);
};
