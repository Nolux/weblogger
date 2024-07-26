import { json, error } from "@sveltejs/kit";
import { db } from "$lib/db.js";

export const POST = async ({ request, locals }) => {
  const { logId } = await request.json();

  if (
    !locals.user.isAdmin &&
    !locals.user.projectController.includes(locals.user.selectedProject)
  ) {
    return error(401, "Missing auth");
  }

  if (!logId) {
    return error(400, "Missing input");
  }

  const log = await db.log.update({
    where: { id: logId },
    data: { deleted: false },
  });

  return json("ok");
};
