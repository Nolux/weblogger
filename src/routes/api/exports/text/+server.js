import { db } from "$lib/db.js";
import { error } from "@sveltejs/kit";

export const GET = async ({ locals, url }) => {
  const projectId = locals.user.selectedProjectId;
  const localDate = url.searchParams.get("localDate");

  if (!projectId || !localDate) {
    return error(400, "Missing input");
  }

  const find = locals.user.assignedProjects.findIndex(
    (x) => x.id == locals.user.selectedProjectId
  );

  const currentProject = locals.user.assignedProjects[find];

  const logs = await db.log.findMany({
    where: { projectId, localDateString: localDate, deleted: false },
    orderBy: { timecodeString: "asc" },
  });

  let textFile = `${currentProject.name}, ${localDate} \r`;

  logs.map((log) => {
    let body = log.body.replace(/[^a-zA-Z0-9!@#$%^&*: ]/g, "");

    textFile = textFile + `${log.timecodeString}\t${body}\t\r`;
  });

  return new Response(textFile, {
    headers: {
      "Content-Type": "text/text",
      "Content-Disposition":
        'attachment; name="fieldName"; filename="' +
        `${localDate} - ${currentProject.name}` +
        '.txt"',
    },
  });
};
