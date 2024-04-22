import { redirect } from "@sveltejs/kit";
import jwt from "jsonwebtoken";

import { PRIVATE_JWT_ACCESS_SECRET } from "$env/static/private";
import { db } from "$lib/db.js";

export async function handle({ event, resolve }) {
  const requestedPath = event.url.pathname;
  console.log(requestedPath);
  const { headers } = event.request;

  const authCookie = event.cookies.get("AuthorizationToken");

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
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
      };

      event.locals.user = sessionUser;
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

  let theme = event.cookies.get("theme");

  if (!theme) {
    event.cookies.set("theme", "dark", {
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 365,
    });
    theme = "dark";
  }

  return await resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace('data-theme=""', `data-theme="${theme}"`);
    },
  });
}
