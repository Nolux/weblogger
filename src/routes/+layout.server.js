export async function load({ locals }) {
  const user = locals.user;
  if (!user) {
    return;
  }

  const find = locals.user.assignedProjects.findIndex(
    (x) => x.id == locals.user.selectedProjectId
  );

  const currentProject = locals.user.assignedProjects[find];

  return { user, currentProject };
}
