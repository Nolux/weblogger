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

  const res = await fetch(`/api/log/search?query=${search}&filters=${filters}`);
  const data = await res.json();

  return { ...data };
}
