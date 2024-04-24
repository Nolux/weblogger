import { json, error } from "@sveltejs/kit";
import { db } from "$lib/db.js";
import { checkIfAdmin } from "$lib/server/auth.js";

export const POST = async ({ request, locals }) => {
  // Check if admin
  if (!checkIfAdmin(locals)) {
    return error(401, "Missing auth");
  }

  const { userId, projectId } = await request.json();

  if (!userId || !projectId) {
    return error(400, "Missing input");
  }

  const project = await db.project.update({
    where: { id: projectId },
    data: { assignedUsers: { connect: { id: userId } } },
  });

  return json(project);
};

export const DELETE = async ({ request, locals }) => {
  // Check if admin
  if (!checkIfAdmin(locals)) {
    return error(401, "Missing auth");
  }

  const { userId, projectId } = await request.json();

  if (!userId || !projectId) {
    return error(400, "Missing input");
  }

  const deletedProject = await db.project.update({
    where: { id: projectId },
    data: { assignedUsers: { disconnect: { id: userId } } },
  });

  return json(deletedProject);
};
