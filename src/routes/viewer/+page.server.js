export async function load({ fetch, locals }) {
  const find = locals.user.assignedProjects.findIndex(
    (x) => x.id == locals.user.selectedProjectId
  );

  const currentProject = locals.user.assignedProjects[find];
  const perPage = 10;

  const res = await fetch(
    `/api/log?page=0&perPage=${perPage}&localDate=${
      currentProject.projectDays.sort()[currentProject.projectDays.length - 1]
    }&asc=asc`
  );

  const data = await res.json();

  return {
    ...data,
    user: locals.user,
    projectDays: currentProject.projectDays.sort(),
    selectedDate:
      currentProject.projectDays.sort()[
        currentProject.projectDays.sort().length - 1
      ],
    perPage: perPage,
  };
}
