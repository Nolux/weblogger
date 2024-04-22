import { fail, redirect } from "@sveltejs/kit";

export async function load(event) {
  event.cookies.delete("AuthorizationToken", { path: "/" });
  event.locals.user = null;
  return;
}
