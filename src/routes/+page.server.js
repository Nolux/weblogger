import { db } from "$lib/db.js";

export async function load({ locals, request }) {
  const headers = request.headers;
  const userAgent = headers.get("user-agent");
  const user = locals.user;

  if (!user) {
    const stats = await db.stats.findMany();

    let allTotalLogs = 0;
    let allTotalCharacters = 0;
    let allDaysLogged = 0;

    stats.map((stat) => {
      allTotalLogs = allTotalLogs + stat.projectTotalLogs;
      allTotalCharacters = allTotalCharacters + stat.projectTotalCharacters;
      allDaysLogged = allDaysLogged + stat.projectTotalDays;
    });

    return {
      userAgent: userAgent,
      stats: { allTotalLogs, allTotalCharacters, allDaysLogged },
    };
  }

  const stats = await db.stats.findFirst({
    where: { projectId: user.selectedProjectId },
  });

  return { user, stats };
}
