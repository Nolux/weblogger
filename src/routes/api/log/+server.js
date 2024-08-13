import { json, error } from "@sveltejs/kit";
import dayjs from "dayjs";

import { db } from "$lib/db.js";
import { checkIfAdmin, checkIfOwner } from "$lib/server/auth.js";
import { editColors } from "$lib/helpers/editColors.js";
import { LogModel } from "$lib/Models/Log.js";

export const GET = async ({ url, locals }) => {
  const projectId = locals.user.selectedProjectId;
  const perPage = url.searchParams.get("perPage");
  const page = url.searchParams.get("page");
  const localDate = url.searchParams.get("localDate");
  const asc = url.searchParams.get("asc") || "desc";
  let filters = url.searchParams.get("filters");
  const afterTc = url.searchParams.get("afterTc");

  if (filters) {
    filters = filters.split(",");
  }

  if (!perPage || !page || !projectId) {
    return error(400, "Missing input");
  }

  // Check if user is assigned to project
  if (!locals.user.projectIds?.includes(projectId)) {
    return error(402, "Auth error");
  }

  let count = 0;
  let logs = [];

  let searchObj = { projectId: projectId };

  // Show deleted post if admin or projectController
  if (
    !locals.user.isAdmin &&
    !locals.user.projectController.includes(projectId)
  ) {
    searchObj.deleted = false;
  }

  if (filters) {
    searchObj.tags = { hasEvery: filters };
  }
  if (localDate) {
    searchObj.localDateString = localDate;
  }

  if (afterTc) {
    let timecode = afterTc.split(":");

    const timecodeDateObj = dayjs(localDate)
      .add(timecode[0], "h")
      .add(timecode[1], "m")
      .add(timecode[2], "s")
      .add(timecode[3] * 40, "ms");

    searchObj.timecodeDateObj = {
      gte: timecodeDateObj.format("YYYY-MM-DD[T]HH:mm:ss.SSSZ"),
    };
  }
  count = await db.log.count({
    where: searchObj,
  });

  logs = await db.log.findMany({
    where: searchObj,
    orderBy: { timecodeString: asc },
    skip: perPage * page,
    take: parseInt(perPage),
  });

  const find = locals.user.assignedProjects.findIndex(
    (x) => x.id == locals.user.selectedProjectId
  );

  const currentProject = locals.user.assignedProjects[find];

  logs.map((log) => {
    if (log.marker) {
      log.markerColor = "";

      let foundColor =
        currentProject.markerColors[
          currentProject.markerColors.findIndex((x) => x.text == log.marker)
        ];
      if (foundColor) {
        log.markerColor = editColors[foundColor.color].css;
        log.markerTextColor = editColors[foundColor.color].cssText;
      }
    }
  });

  return json({
    logs,
    page: { page, totalCount: count, totalPages: Math.ceil(count / perPage) }, // <--- TODO: WRONG
  });
};

export const POST = async ({ request, locals }) => {
  let { body, timecode, localDate } = await request.json();

  const user = locals.user;
  const projectId = user.selectedProjectId;

  console.log(body, timecode, localDate, projectId);

  if (!body || !timecode || !localDate || !projectId) {
    return error(400, "Missing input");
  }

  // Look for capital words and marker words ending with:
  const tags = body.match(/\b[A-Z0-9]{2,}\b/g) || [];
  let marker = body.match(/\b[A-Z0-9]{1,}\b:/);
  let shortMarkers = body.match(/\b[A-Z0-9]{1,}\b:/g);
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

  const localDateString = `${localDate.year
    .toString()
    .padStart(4, "0")}.${localDate.month
    .toString()
    .padStart(2, "0")}.${localDate.day.toString().padStart(2, "0")}`;

  // Create timecode obj
  const timecodeString = `${timecode.hours
    .toString()
    .padStart(2, "0")}:${timecode.minutes
    .toString()
    .padStart(2, "0")}:${timecode.seconds
    .toString()
    .padStart(2, "0")}:${timecode.frames.toString().padStart(2, "0")}`;

  // Check if project has this day?
  const project = await db.project.findUnique({
    where: { id: projectId, projectDays: { has: localDateString } },
  });

  if (!project) {
    const project = await db.project.update({
      where: { id: projectId },
      data: { projectDays: { push: localDateString } },
    });
  }

  const timecodeDateObj = dayjs(localDateString)
    .add(timecode.hours, "h")
    .add(timecode.minutes, "m")
    .add(timecode.seconds, "s")
    .add(timecode.frames * 40, "ms");

  const logObj = {
    body: body.trim(),
    tags: uniqueTags ? uniqueTags : [],
    marker,
    timecode,
    timecodeString,
    timecodeDateObj: timecodeDateObj.format("YYYY-MM-DD[T]HH:mm:ss.SSSZ"),
    timezone: timecodeDateObj.format("Z"),
    localDate,
    localDateString,
    createdById: user.id,
    createdByFullName: user.fullName,
    project: { connect: { id: projectId } },
  };

  const result = LogModel.safeParse(logObj);

  if (!result.success) {
    console.log(result.error.format());

    return error(400, "Input error");
  }

  // Write to db
  const log = await db.log.create({
    data: logObj,
  });

  return json(log);
};

export const PATCH = async ({ request, locals }) => {
  const { id, updatedLog } = await request.json();

  console.log(id, updatedLog);

  if (!id || !updatedLog) {
    return error(400, "Missing input");
  }

  // Look for capital words and marker words ending with:
  const tags = updatedLog.body.match(/\b[A-Z0-9]{2,}\b/g) || [];
  let marker = updatedLog.body.match(/\b[A-Z0-9]{1,}\b:/);
  if (marker) {
    marker = marker[0];
    tags[tags.indexOf(marker.split(":")[0])] = marker;
  }

  // Check for duplicate tags
  const uniqueTags = tags?.filter(
    (item, index) => tags.indexOf(item) === index
  );

  // Create localdate obj

  const localDateString = `${updatedLog.localDate.year
    .toString()
    .padStart(4, "0")}.${updatedLog.localDate.month
    .toString()
    .padStart(2, "0")}.${updatedLog.localDate.day.toString().padStart(2, "0")}`;

  // Create timecode obj
  const timecodeString = `${updatedLog.timecode.hours
    .toString()
    .padStart(2, "0")}:${updatedLog.timecode.minutes
    .toString()
    .padStart(2, "0")}:${updatedLog.timecode.seconds
    .toString()
    .padStart(2, "0")}:${updatedLog.timecode.frames
    .toString()
    .padStart(2, "0")}`;

  // Update TimecodeDateObj
  const timecodeDateObj = dayjs(localDateString)
    .add(updatedLog.timecode.hours, "h")
    .add(updatedLog.timecode.minutes, "m")
    .add(updatedLog.timecode.seconds, "s")
    .add(updatedLog.timecode.frames * 40, "ms");

  const logObj = {
    ...updatedLog,
    marker,
    tags: uniqueTags,
    localDateString,
    timecodeString,
    timecodeDateObj: timecodeDateObj.format("YYYY-MM-DD[T]HH:mm:ss.SSSZ"),
    timezone: timecodeDateObj.format("Z"),
  };

  const result = LogModel.safeParse(logObj);

  if (!result.success) {
    console.log(result.error.format());

    return error(400, "Input error");
  }

  const log = await db.log.update({
    where: { id: id },
    data: logObj,
  });

  const find = locals.user.assignedProjects.findIndex(
    (x) => x.id == locals.user.selectedProjectId
  );

  const currentProject = locals.user.assignedProjects[find];

  if (log.marker) {
    log.markerColor = "";

    let foundColor =
      currentProject.markerColors[
        currentProject.markerColors.findIndex((x) => x.text == log.marker)
      ];
    if (foundColor) {
      log.markerColor = editColors[foundColor.color].css;
      log.markerTextColor = editColors[foundColor.color].cssText;
    }
  }

  return json(log);
};

export const DELETE = async ({ request, locals }) => {
  const { logId } = await request.json();

  if (!logId) {
    return error(400, "Missing input");
  }

  const log = await db.log.findUnique({ where: { id: logId } });

  // Check if admin or owner
  if (!checkIfAdmin(locals)) {
    if (!checkIfOwner(log.createdById, locals)) {
      return error(401, "Missing auth");
    }
  }

  const deletedLog = await db.log.delete({ where: { id: logId } });

  return json("ok");
};
