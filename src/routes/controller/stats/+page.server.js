import { db } from "$lib/db.js";

export async function load({ locals }) {
  const user = locals.user;
  const stats = await db.stats.findFirst({
    where: { projectId: user.selectedProjectId },
  });
  return { stats };
}
