import { json } from "@sveltejs/kit";
import { db } from "$lib/db.js";

export const GET = async ({ request, locals, url }) => {
  const projectId = locals.user.selectedProjectId;
  const query = url.searchParams.get("query");
  let filters = url.searchParams.get("filters");

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

  if (filters.length > 0) {
    searchObj.pipeline[0].$match.tags = { $all: filters };
  }

  console.log(searchObj.pipeline[0].$match);

  const logs = await db.log.aggregateRaw(searchObj);

  console.log(logs);

  return json({ logs });
};
