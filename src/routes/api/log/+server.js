import { json, error } from "@sveltejs/kit";
import { db } from "$lib/db.js";
import { checkIfAdmin, checkIfOwner } from "$lib/server/auth.js";

export const GET = async ({ url, locals }) => {
  const projectId = locals.user.selectedProjectId;
  const perPage = url.searchParams.get("perPage");
  const page = url.searchParams.get("page");

  if (!perPage || !page || !projectId) {
    return error(400, "Missing input");
  }

  // Check if user is assigned to project
  if (!locals.user.projectIds?.includes(projectId)) {
    return error(402, "Auth error");
  }

  const count = await db.log.count({
    where: { projectId: projectId },
  });

  const logs = await db.log.findMany({
    where: { projectId: projectId },
    orderBy: { createdAt: "desc" },
    skip: perPage * page,
    take: parseInt(perPage),
  });

  return json({
    logs,
    page: { page, totalCount: count, totalPages: Math.floor(count / perPage) }, // <--- TODO: WRONG
  });
};

export const POST = async ({ request, locals }) => {
  const { body, timecode, localDate } = await request.json();

  const user = locals.user;
  const projectId = user.selectedProjectId;

  console.log(body, timecode, localDate, projectId);

  if (!body || !timecode || !localDate || !projectId) {
    return error(400, "Missing input");
  }

  // assign tags?
  // Create localdate obj
  // Tell socketIO that there are new logs

  const log = await db.log.create({
    data: {
      body,
      timecode,
      localDate,
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
