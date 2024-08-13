import { json } from "@sveltejs/kit";
import { db } from "$lib/db.js";
import { editColors } from "$lib/helpers/editColors.js";

export const GET = async ({ request, locals, url }) => {
  const projectId = locals.user.selectedProjectId;
  const query = url.searchParams.get("query");
  const perPage = url.searchParams.get("perPage");
  const page = url.searchParams.get("page");
  let filters = url.searchParams.get("filters");
  const localDate = url.searchParams.get("localDate");

  const find = locals.user.assignedProjects.findIndex(
    (x) => x.id == locals.user.selectedProjectId
  );

  const currentProject = locals.user.assignedProjects[find];

  if (filters) {
    filters = filters.split(",");
  }

  const splitSearch = query.split(" ");
  let regex = "";

  splitSearch.map((str) => (regex = regex + `(?=.*\\b${str}\\b.*)`));

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
      { $skip: perPage * page },
      { $limit: parseInt(perPage) },
    ],
  };

  let countSearchObj = {
    pipeline: [
      {
        $match: {
          body: { $regex: regex, $options: "i" },
          projectId: { $eq: { $oid: projectId } },
          deleted: true,
        },
      },
      {
        $sort: {
          localDateString: -1,
          timecodeString: -1,
        },
      },
      { $count: "document_count" },
    ],
  };

  if (localDate != null || localDate != undefined) {
    searchObj.pipeline[0].$match.localDateString = localDate;
    countSearchObj.pipeline[0].$match.localDateString = localDate;
  }

  // Show deleted post if admin or projectController
  if (
    !locals.user.isAdmin &&
    !locals.user.projectController.includes(projectId)
  ) {
    searchObj.pipeline[0].$match.deleted = false;
    countSearchObj.pipeline[0].$match.deleted = false;
  }

  if (filters.length > 0) {
    searchObj.pipeline[0].$match.tags = { $all: filters };
    countSearchObj.pipeline[0].$match.tags = { $all: filters };
  }

  let logs = await db.log.aggregateRaw(searchObj);

  let count = await db.log.aggregateRaw(countSearchObj);
  if (count.length > 0) {
    count = count[0]["document_count"];
  }
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

  return json({
    logs,
    page: { page, totalCount: count, totalPages: Math.ceil(count / perPage) },
  });
};
