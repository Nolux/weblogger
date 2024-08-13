export async function load({ params, fetch, locals, url }) {
  const search = url.searchParams.get("query");
  let filters = url.searchParams.get("filters");

  if (filters) {
    filters = filters.split(" ");
  } else {
    filters = "";
  }

  const find = locals.user.assignedProjects.findIndex(
    (x) => x.id == locals.user.selectedProjectId
  );

  const currentProject = locals.user.assignedProjects[find];
  const perPage = 50;

  const selectedDate =
    url.searchParams.get("selectedDate") ||
    currentProject.projectDays.sort()[currentProject.projectDays.length - 1];

  return {
    user: locals.user,
    projectDays: currentProject.projectDays.sort(),
    selectedDate,
    perPage: perPage,
  };
}
