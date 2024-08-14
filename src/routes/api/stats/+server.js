import { db } from "$lib/db.js";
import { error, json } from "@sveltejs/kit";
import _ from "lodash";

export const GET = async ({ request, locals }) => {
  const startTime = Date.now();
  if (locals.user.projectController.includes(locals.user.selectedProjectId)) {
  } else if (locals.user.isAdmin) {
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
        mostUsedTags[tag].timesUsed = mostUsedTags[tag].timesUsed + 1;
      } else {
        mostUsedTags[tag] = { timesUsed: 1, name: tag };
      }
    });
  });
  const sortedMostUsedTags = _.orderBy(mostUsedTags, ["timesUsed"], ["desc"]);

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
      mostLogs[log.createdById].logs = mostLogs[log.createdById].logs + 1;
      mostLogs[log.createdById].totalChars =
        mostLogs[log.createdById].totalChars + log.body.length;
    } else {
      mostLogs[log.createdById] = {
        id: log.createdById,
        name: log.createdByFullName,
        logs: 1,
        totalChars: log.body.length,
      };
    }
  });

  const sortedMostLogs = _.orderBy(mostLogs, ["logs"], ["desc"]);
  sortedMostLogs.map((user) => {
    user.avgChars = Math.floor(user.totalChars / user.logs);
  });

  // Busiest day
  let busiestDays = {};
  logs.map((log) => {
    if (busiestDays[log.localDateString]) {
      busiestDays[log.localDateString].logs =
        busiestDays[log.localDateString].logs + 1;
    } else {
      busiestDays[log.localDateString] = {
        logs: 1,
        name: log.localDateString,
      };
    }
  });
  const sortedBusiestDays = _.orderBy(busiestDays, ["logs"], ["desc"]);

  // Total chars
  let totalChars = 0;
  logs.map(({ body }) => {
    totalChars = totalChars + body.length;
  });

  const endTime = Date.now();
  return json({
    sortedBusiestDays,
    sortedMostLogs,
    sortedMostUsedTags,
    sortedMostUsedTagsWithoutMarkers,
    longestLog,
    info: {
      totalLogs: count,
      executionTime: endTime - startTime,
      daysLogged: sortedBusiestDays.length,
      totalChars: totalChars,
    },
  });
};
