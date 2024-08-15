import { db } from "../db.js";
import dayjs from "dayjs";

export const generateStats = async () => {
  const todayDate = dayjs().format("YYYY.MM.DD");

  const projects = await db.project.findMany();

  projects.map(async (project) => {
    const logs = await db.log.findMany({
      where: { projectId: project.id, deleted: false },
    });
    const projectTotalLogs = await db.log.count({
      where: { projectId: project.id, deleted: false },
    });

    let todayLogs = 0;

    let projectTotalCharacters = 0;
    let todayCharacters = 0;

    logs.map((log) => {
      projectTotalCharacters = projectTotalCharacters + log.body.length;
      if (log.localDateString === todayDate) {
        todayLogs = todayLogs + 1;
        todayCharacters = todayCharacters + log.body.length;
      }
    });

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
      },
      create: {
        projectId: project.id,
        projectTotalLogs,
        projectTotalDays: project.projectDays?.length,
        projectTotalCharacters,
        todayLogs,
        todayCharacters,
      },
    });
  });
};
