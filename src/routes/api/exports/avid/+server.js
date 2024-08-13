import { error } from "@sveltejs/kit";

import { editColors } from "$lib/helpers/editColors.js";
import { getLogsWithFilters } from "$lib/helpers/getLogsWithFilters.js";

export const GET = async ({ locals, url }) => {
  const projectId = locals.user.selectedProjectId;
  const localDate = url.searchParams.get("localDate");
  let filters = url.searchParams.get("filters");
  const afterTc = url.searchParams.get("afterTc");

  if (!projectId || !localDate) {
    return error(400, "Missing input");
  }

  const find = locals.user.assignedProjects.findIndex(
    (x) => x.id == locals.user.selectedProjectId
  );

  const currentProject = locals.user.assignedProjects[find];

  const { logs, count } = await getLogsWithFilters({
    projectId,
    localDate,
    filters,
    afterTc,
  });

  let returnString = "";

  logs.map((log) => {
    let body = log.body.replace(/\n/g, " ");
    //body = body.replace(/[^a-zA-Z0-9!@#$%^&*: ]/g, "");

    let color = false;
    let avidColor = "black";

    if (log.marker) {
      color =
        currentProject.markerColors[
          currentProject.markerColors.findIndex((x) => x.text == log.marker)
        ]?.color;

      avidColor = editColors[color]?.avid || "black";
    }

    // Change color based on marker here

    returnString =
      returnString +
      `${log.marker ? log.marker : "NA:"}\t${
        log.timecodeString
      }\tV1\t${avidColor}\t${body}\n`;
  });

  return new Response(returnString, {
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition":
        'attachment; name="fieldName"; filename="' +
        `${localDate} - ${currentProject.name} - ${count}${
          filters.length > 0 ? " - " + filters.split(",").join(",") : ""
        }${afterTc ? " - " + afterTc.replaceAll(":", "") : ""}` +
        '.txt"',
    },
  });
};
