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

  let textFile = `${currentProject.name}, ${localDate} \r`;

  logs.map((log) => {
    let body = log.body.replace(/\n/g, " ");

    textFile = textFile + `${log.timecodeString}\t${body}\r`;
  });

  return new Response(textFile, {
    headers: {
      "Content-Type": "text/text",
      "Content-Disposition":
        'attachment; name="fieldName"; filename="' +
        `${localDate} - ${currentProject.name}${
          filters.length > 0 ? " - " + filters.split(",").join(",") : ""
        }${afterTc ? " - " + afterTc.replaceAll(":", "") : ""}` +
        '.txt"',
    },
  });
};
