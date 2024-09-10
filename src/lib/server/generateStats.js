import { db } from "../db.js";
import dayjs from "dayjs";
import _ from "lodash";

export const generateStats = async () => {
  const startTime = Date.now();

  const todayDate = dayjs().format("YYYY.MM.DD");

  const projects = await db.project.findMany();

  projects.map(async (project) => {
    let searchObj = { projectId: project.id, deleted: false };

    // Get logs from db
    const logs = await db.log.findMany({
      where: searchObj,
    });

    const projectTotalLogs = await db.log.count({
      where: searchObj,
    });

    let todayLogs = 0;

    let projectTotalCharacters = 0;
    let todayCharacters = 0;

    let mostUsedTags = {};
    let mostLogs = {};
    let busiestDays = {};

    logs.map((log) => {
      // Project total characters

      projectTotalCharacters = projectTotalCharacters + log.body.length;

      // If logged today
      if (log.localDateString === todayDate) {
        todayLogs = todayLogs + 1;
        todayCharacters = todayCharacters + log.body.length;
      }

      // Most used tags
      log.tags.map((tag) => {
        if (mostUsedTags[tag]) {
          mostUsedTags[tag].timesUsed = mostUsedTags[tag].timesUsed + 1;
        } else {
          mostUsedTags[tag] = { timesUsed: 1, name: tag };
        }
      });

      // Most logs
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

      // Busiest day
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

    const sortedMostUsedTags = _.orderBy(mostUsedTags, ["timesUsed"], ["desc"]);
    const sortedMostUsedTagsWithoutMarkers = _.filter(
      sortedMostUsedTags,
      (e) => {
        return !e.name.includes(":");
      }
    );

    const sortedMostLogs = _.orderBy(mostLogs, ["logs"], ["desc"]);
    sortedMostLogs.map((user) => {
      user.avgChars = Math.floor(user.totalChars / user.logs);
    });

    const sortedBusiestDays = _.orderBy(busiestDays, ["logs"], ["desc"]);

    const createdStats = await db.stats.upsert({
      where: {
        projectId: project.id,
      },
      update: {
        projectTotalLogs,
        projectTotalDays: project.projectDays?.length,
        projectTotalCharacters,
        todayLogs,
        todayCharacters,
        sortedBusiestDays,
        sortedMostLogs,
        sortedMostUsedTags,
        sortedMostUsedTagsWithoutMarkers,
      },
      create: {
        projectId: project.id,
        projectTotalLogs,
        projectTotalDays: project.projectDays?.length,
        projectTotalCharacters,
        todayLogs,
        todayCharacters,
        sortedBusiestDays,
        sortedMostLogs,
        sortedMostUsedTags,
        sortedMostUsedTagsWithoutMarkers,
      },
    });
  });
  const endTime = Date.now();
  console.log("executionTime", endTime - startTime);
};
