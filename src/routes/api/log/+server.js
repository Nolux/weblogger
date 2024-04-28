import { json, error } from "@sveltejs/kit";
import { db } from "$lib/db.js";
import { checkIfAdmin, checkIfOwner } from "$lib/server/auth.js";

export const GET = async ({ url, locals }) => {
  const projectId = locals.user.selectedProjectId;
  const perPage = url.searchParams.get("perPage");
  const page = url.searchParams.get("page");
  const localDate = url.searchParams.get("localDate");
  let filters = url.searchParams.get("filters");

  if (filters) {
    filters = filters.split(",");
  }

  console.log(localDate);

  if (!perPage || !page || !projectId) {
    return error(400, "Missing input");
  }

  // Check if user is assigned to project
  if (!locals.user.projectIds?.includes(projectId)) {
    return error(402, "Auth error");
  }

  let count = 0;
  let logs = [];

  let searchObj = { projectId: projectId, deleted: false };
  if (filters) {
    searchObj.tags = { hasEvery: filters };
  }
  if (localDate) {
    searchObj.localDateString = localDate;
  }

  count = await db.log.count({
    where: searchObj,
  });

  logs = await db.log.findMany({
    where: searchObj,
    orderBy: { createdAt: "desc" },
    skip: perPage * page,
    take: parseInt(perPage),
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
  const tags = body.match(/\b[A-Z0-9]{2,}\b/g);
  const marker = body.match(/\b[A-Z0-9]{2,}\b:/)[0];
  if (marker) {
    tags[tags.indexOf(marker.split(":")[0])] = marker;
  }

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

  // Write to db
  const log = await db.log.create({
    data: {
      body,
      tags: tags ? tags : [],
      timecode,
      timecodeString,
      localDate,
      localDateString,
      createdById: user.id,
      createdByFullName: user.fullName,
      project: { connect: { id: projectId } },
    },
  });

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
