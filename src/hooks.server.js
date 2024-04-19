export async function handle({ event, resolve }) {
  if (event.url.pathname.startsWith("/")) {
    const response = await resolve(event);
    return response;
  }

  const response = await resolve(event);
  return response;
}
