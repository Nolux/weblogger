import { json } from "@sveltejs/kit";
import { db } from "$lib/db.js";
import { editColors } from "$lib/helpers/editColors.js";

export const GET = async ({ request, locals, url }) => {
  const projectId = locals.user.selectedProjectId;
  const query = url.searchParams.get("query");
  let filters = url.searchParams.get("filters");

  const find = locals.user.assignedProjects.findIndex(
    (x) => x.id == locals.user.selectedProjectId
  );

  const currentProject = locals.user.assignedProjects[find];

  if (filters) {
    filters = filters.split(",");
  }

  const splitSearch = query.split(" ");
  console.log(splitSearch);
  let regex = "";

  splitSearch.map((str) => (regex = regex + `(?=.*\\b${str}\\b.*)`));

  console.log(filters);

  let searchObj = {
    pipeline: [
      {
        $match: {
          body: { $regex: regex, $options: "i" },
          projectId: { $eq: { $oid: projectId } },
        },
      },
      {
        $sort: {
          localDateString: -1,
          timecodeString: -1,
        },
      },
    ],
  };

  // Show deleted post if admin or projectController
  if (
    !locals.user.isAdmin &&
    !locals.user.projectController.includes(projectId)
  ) {
    searchObj.pipeline[0].$match.deleted = false;
  }

  if (filters.length > 0) {
    searchObj.pipeline[0].$match.tags = { $all: filters };
  }

  console.log(searchObj.pipeline[0].$match);

  let logs = await db.log.aggregateRaw(searchObj);

  logs.map((log) => {
    if (log.marker) {
      log.markerColor = "";

      let foundColor =
        currentProject.markerColors[
          currentProject.markerColors.findIndex((x) => x.text == log.marker)
        ];
      if (foundColor) {
        log.markerColor = editColors[foundColor.color].css;
        log.markerTextColor = editColors[foundColor.color].cssText;
      }
    }

    log.id = log._id["$oid"];
    log.createdById = log.createdById["$oid"];
  });

  return json({ logs });
};
