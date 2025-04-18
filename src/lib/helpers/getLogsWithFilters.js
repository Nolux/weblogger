import { db } from "$lib/db.js";
import dayjs from "dayjs";

export const getLogsWithFilters = async ({
  projectId,
  localDate,
  filters,
  afterTc,
  beforeTc,
  excludeFilter,
}) => {
  let searchObj = { projectId: projectId, deleted: false };

  if (filters) {
    filters = filters.split(",");
    if (excludeFilter) {
      searchObj.NOT = { tags: { hasSome: filters } };
    } else {
      searchObj.tags = { hasEvery: filters };
    }
  }

  console.log(searchObj);

  if (localDate) {
    searchObj.localDateString = localDate;
  }

  if (afterTc) {
    let timecode = afterTc.split(":");

    searchObj.timecodeDateObj = {};

    const timecodeDateObj = dayjs(localDate)
      .add(timecode[0], "h")
      .add(timecode[1], "m")
      .add(timecode[2], "s")
      .add(timecode[3] * 40, "ms");

    searchObj.timecodeDateObj.gte = timecodeDateObj.format(
      "YYYY-MM-DD[T]HH:mm:ss.SSSZ"
    );
  }

  if (beforeTc) {
    let timecode = beforeTc.split(":");

    const timecodeDateObj = dayjs(localDate)
      .add(timecode[0], "h")
      .add(timecode[1], "m")
      .add(timecode[2], "s")
      .add(timecode[3] * 40, "ms");

    searchObj.timecodeDateObj.lte = timecodeDateObj.format(
      "YYYY-MM-DD[T]HH:mm:ss.SSSZ"
    );
  }

  console.log(searchObj);

  const count = await db.log.count({
    where: searchObj,
  });

  const logs = await db.log.findMany({
    where: searchObj,
    orderBy: { timecodeString: "asc" },
  });

  return { logs, count };
};
