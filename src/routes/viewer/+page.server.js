export async function load({ fetch, locals, url }) {
  const find = locals.user.assignedProjects.findIndex(
    (x) => x.id == locals.user.selectedProjectId
  );

  const currentProject = locals.user.assignedProjects[find];
  const perPage = 30;

  const selectedDate =
    url.searchParams.get("selectedDate") ||
    currentProject.projectDays.sort()[currentProject.projectDays.length - 1];

  let filters = url.searchParams.get("filters");

  if (filters) {
    filters = filters.split(" ");
  } else {
    filters = "";
  }

  const res = await fetch(
    `/api/log?page=0&perPage=${perPage}&localDate=${selectedDate}&filters=${filters}&asc=asc`
  );

  const data = await res.json();

  return {
    ...data,
    user: locals.user,
    projectDays: currentProject.projectDays.sort(),
    selectedDate,
    perPage: perPage,
  };
}
