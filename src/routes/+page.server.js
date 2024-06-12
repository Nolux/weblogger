export async function load({ locals, request }) {
  const headers = request.headers;
  const userAgent = headers.get("user-agent");
  const user = locals.user;

  if (!user) {
    return { userAgent: userAgent };
  }

  return { user };
}
