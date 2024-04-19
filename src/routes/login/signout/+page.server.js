import { fail, redirect } from "@sveltejs/kit";

export async function load(event) {
  console.log(Object.getOwnPropertyNames(event.cookies));
  event.cookies.delete("AuthorizationToken", { path: "/" });
  event.locals.user = null;
  return;
}
