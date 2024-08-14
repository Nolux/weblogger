import { db } from "$lib/db.js";
import { error, json } from "@sveltejs/kit";
import _ from "lodash";

export const GET = async ({ request, locals }) => {
  const startTime = Date.now();
  if (locals.user.projectController.includes(locals.user.selectedProjectId)) {
    console.log("CONTROLLER");
  } else if (locals.user.isAdmin) {
    console.log("ADMIN");
  } else {
    return error(401, "Missing auth");
  }

  const projectId = locals.user.selectedProjectId;
  let searchObj = { projectId: projectId, deleted: false };

  const logs = await db.log.findMany({
    where: searchObj,
    orderBy: { timecodeString: "asc" },
  });

  const count = await db.log.count({
    where: searchObj,
    orderBy: { timecodeString: "asc" },
  });

  // Most used tags
  let mostUsedTags = {};
  logs.map((log) => {
    log.tags.map((tag) => {
      if (mostUsedTags[tag]) {
        mostUsedTags[tag].score = mostUsedTags[tag].score + 1;
      } else {
        mostUsedTags[tag] = { score: 1, name: tag };
      }
    });
  });
  const sortedMostUsedTags = _.orderBy(mostUsedTags, ["score"], ["desc"]);

  const sortedMostUsedTagsWithoutMarkers = _.filter(sortedMostUsedTags, (e) => {
    return !e.name.includes(":");
  });

  // Longest log
  let longestLog = { body: "" };
  logs.map((log) => {
    if (longestLog.body.length < log.body.length) {
      longestLog = { ...log, length: log.body.length };
    }
  });

  // Most logs
  let mostLogs = {};
  logs.map((log) => {
    if (mostLogs[log.createdById]) {
      mostLogs[log.createdById].score = mostLogs[log.createdById].score + 1;
    } else {
      mostLogs[log.createdById] = {
        id: log.createdById,
        name: log.createdByFullName,
        score: 1,
      };
    }
  });
  const sortedMostLogs = _.orderBy(mostLogs, ["score"], ["desc"]);

  // Busiest day
  let busiestDays = {};
  logs.map((log) => {
    if (busiestDays[log.localDateString]) {
      busiestDays[log.localDateString].score =
        busiestDays[log.localDateString].score + 1;
    } else {
      busiestDays[log.localDateString] = {
        score: 1,
        name: log.localDateString,
      };
    }
  });
  const sortedBusiestDays = _.orderBy(busiestDays, ["score"], ["desc"]);

  const endTime = Date.now();
  return json({
    sortedBusiestDays,
    sortedMostLogs,
    sortedMostUsedTags,
    sortedMostUsedTagsWithoutMarkers,
    longestLog,
    info: { totalLogs: count, executionTime: endTime - startTime },
  });
};
