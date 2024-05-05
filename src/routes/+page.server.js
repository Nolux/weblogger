export async function load(event) {
  const user = event.locals.user;
  if (!user) {
    return;
  }

  return { user };
}
