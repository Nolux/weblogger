import { json, error } from "@sveltejs/kit";
import { db } from "$lib/db.js";
import { checkIfAdmin, checkIfOwner } from "$lib/server/auth.js";

export const DELETE = async ({ request, locals }) => {
  const { userId } = await request.json();

  if (!userId) {
    return error(400, "Missing input");
  }

  // Check if admin or owner
  if (!checkIfAdmin(locals)) {
    if (!checkIfOwner(userId, locals)) {
      return error(401, "Missing auth");
    }
  }

  // Get project from db
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  console.log(user);

  // Remove all connections to current projects
  const removeConnectedProjects = await db.user.update({
    where: { id: userId },
    data: {
      assignedProjects: {
        disconnect: [
          ...user.projectIds.map((projectId) => {
            return { id: projectId };
          }),
        ],
      },
    },
  });

  // TODO: remove logs?

  // Finally remove Project
  const deletedUser = await db.user.delete({
    where: { id: userId },
  });

  return json(deletedUser);
};
