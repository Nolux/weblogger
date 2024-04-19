import { redirect } from "@sveltejs/kit";
import jwt from "jsonwebtoken";

import { PRIVATE_JWT_ACCESS_SECRET } from "$env/static/private";
import { db } from "$lib/db.js";

export async function handle({ event, resolve }) {
  const requestedPath = event.url.pathname;
  const { headers } = event.request;

  const authCookie = event.cookies.get("AuthorizationToken");

  console.log(authCookie);

  if (authCookie) {
    // Remove Bearer prefix

    const token = authCookie.split(" ")[1];

    try {
      const jwtUser = jwt.verify(token, PRIVATE_JWT_ACCESS_SECRET);

      if (typeof jwtUser === "string") {
        throw new Error("Something went wrong");
      }

      const user = await db.user.findUnique({
        where: {
          id: jwtUser.id,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const sessionUser = {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      };

      event.locals.user = sessionUser;
      console.log(sessionUser);
    } catch (error) {
      console.error(error);
    }
  } else {
    event.locals.user = null;
  }
  /* 
  if (requestedPath == "/" || requestedPath.startsWith("/login")) {
    // Un-auth routes here
    const response = await resolve(event);
    return response;
  }
 */

  // Restrict all routes under /admin
  if (requestedPath.includes("/admin")) {
    if (!event.locals.user.admin) {
      throw redirect(303, "/");
    }
  }

  const response = await resolve(event);
  return response;
}
