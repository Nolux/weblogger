import { json, error } from "@sveltejs/kit";
import { db } from "$lib/db.js";

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
    let marker = log.body.match(/\b[A-Z0-9]{2,}\b:/);
    if (marker) {
      marker = marker[0];
      tags[tags.indexOf(marker.split(":")[0])] = marker;
    }

    // Check for duplicate tags
    const uniqueTags = tags?.filter(
      (item, index) => tags.indexOf(item) === index
    );

    // Create localdate obj

    const localDateString = `${log.localDate.year
      .toString()
      .padStart(4, "0")}.${log.localDate.month
      .toString()
      .padStart(2, "0")}.${log.localDate.day.toString().padStart(2, "0")}`;

    // Create timecode obj
    const timecodeString = `${log.timecode.hours
      .toString()
      .padStart(2, "0")}:${log.timecode.minutes
      .toString()
      .padStart(2, "0")}:${log.timecode.seconds
      .toString()
      .padStart(2, "0")}:${log.timecode.frames.toString().padStart(2, "0")}`;

    return {
      body: log.body,
      tags: uniqueTags ? uniqueTags : [],
      marker: log.marker,
      timecode: log.timecode,
      timecodeString,
      localDate: log.localDate,
      localDateString,
      createdById: user.id,
      createdByFullName: user.fullName,
      projectId: projectId,
    };
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
