import { getLogsWithFilters } from "$lib/helpers/getLogsWithFilters.js";
import { error } from "@sveltejs/kit";

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

  let csv = `${currentProject.name}, ${localDate} \r Timecode, Log, Tags, Marker, Created By \r`;

  logs.map((log) => {
    let body = log.body.replace(/[^a-zA-Z0-9!@#$%^&*: ]/g, "");

    csv =
      csv +
      `${log.timecodeString},${body}, ${log.tags.join(" ")}, ${
        log.marker ? log.marker : ""
      }, ${log.createdByFullName}\r`;
  });

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition":
        'attachment; name="fieldName"; filename="' +
        `${localDate} - ${currentProject.name}${
          filters.length > 0 ? " - " + filters.split(",").join(",") : ""
        }${afterTc ? " - " + afterTc.replaceAll(":", "") : ""}` +
        '.csv"',
    },
  });
};
