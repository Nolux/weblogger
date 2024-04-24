import { json, error } from "@sveltejs/kit";
import { db } from "$lib/db.js";
import { checkIfAdmin } from "$lib/server/auth.js";

export const GET = async ({ request, locals }) => {
  // Check if admin
  if (!checkIfAdmin(locals)) {
    return error(401, "Missing auth");
  }

  const projects = await db.project.findMany({
    include: {
      assignedUsers: {
        select: { id: true, email: true, firstName: true, lastName: true },
      },
    },
  });
  return json(projects);
};

export const POST = async ({ request, locals }) => {
  // Check if admin
  if (!checkIfAdmin(locals)) {
    return error(401, "Missing auth");
  }

  const { name, contact } = await request.json();
  console.log(name, contact);

  if (!name || !contact) {
    return error(400, "Missing input");
  }

  const project = await db.project.create({
    data: { name: name, contact: contact },
  });

  return json(project);
};

export const DELETE = async ({ request, locals }) => {
  // Check if admin
  if (!checkIfAdmin(locals)) {
    return error(401, "Missing auth");
  }

  const { projectId } = await request.json();

  if (!projectId) {
    return error(400, "Missing input");
  }

  // Get project from db
  const project = await db.project.findUnique({
    where: { id: projectId },
  });

  // Remove all connections to current users
  const removeConnectedUsers = db.project.update({
    where: { id: projectId },
    data: {
      assingedUsers: {
        disconnect: [
          ...project.userIds.map((userId) => {
            return { id: userId };
          }),
        ],
      },
    },
  });

  // TODO: remove logs?

  // Finally remove Project
  const deletedProject = await db.project.delete({ where: { id: projectId } });

  return json("ok");
};
