import { json, error } from "@sveltejs/kit";
import { db } from "$lib/db.js";

export const POST = async ({ locals, request }) => {
  const { projectId } = await request.json();

  console.log(projectId);
  console.log(locals.user.projectIds);

  console.log(!locals.user.projectIds.includes(projectId));

  // Check if user has access to the project
  if (!locals.user.projectIds.includes(projectId)) {
    return error(401, "Missing auth");
  }

  const updatedUser = await db.user.update({
    where: { id: locals.user.id },
    data: { selectedProjectId: projectId },
  });

  locals.user = updatedUser;

  return json(updatedUser);
};
