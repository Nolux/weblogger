import { json, error } from "@sveltejs/kit";
import { db } from "$lib/db.js";
import { editColors } from "$lib/helpers/editColors.js";

export const GET = async ({ url, locals }) => {
  const projectId = locals.user.selectedProjectId;
  const logId = url.searchParams.get("logId");

  if (!logId || !projectId) {
    return error(400, "Missing input");
  }

  // Check if user is assigned to project
  if (!locals.user.projectIds?.includes(projectId)) {
    return error(402, "Auth error");
  }

  const log = await db.log.findUnique({
    where: { projectId, id: logId },
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
    }
  }

  return json({
    log,
  });
};
