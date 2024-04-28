import { json, error } from "@sveltejs/kit";
import { db } from "$lib/db.js";

export const DELETE = async ({ request, locals }) => {
  const { logId } = await request.json();

  if (!logId) {
    return error(400, "Missing input");
  }

  const log = await db.log.update({
    where: { id: logId },
    data: { deleted: true },
  });

  return json("ok");
};
