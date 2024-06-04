import { redirect } from "@sveltejs/kit";
import jwt from "jsonwebtoken";

import { env } from "$env/dynamic/private";
import { db } from "$lib/db.js";

export async function handle({ event, resolve }) {
  const requestedPath = event.url.pathname;
  const { headers } = event.request;

  const authCookie = event.cookies.get("AuthorizationToken");

  if (authCookie) {
    // Remove Bearer prefix

    const token = authCookie.split(" ")[1];

    try {
      const jwtUser = jwt.verify(token, env.PRIVATE_JWT_ACCESS_SECRET);

      if (typeof jwtUser === "string") {
        throw new Error("Something went wrong");
      }

      const user = await db.user.findUnique({
        where: {
          id: jwtUser.id,
        },
        include: {
          assignedProjects: {
            select: {
              id: true,
              createdAt: true,
              name: true,
              contact: true,
              projectDays: true,
              markerColors: true,
            },
          },
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
        projectController: user.projectController,
        assignedProjects: user.assignedProjects ? user?.assignedProjects : null,
        projectIds: user.projectIds,
        selectedProjectId: user.selectedProjectId,
      };

      event.locals.user = sessionUser;
    } catch (error) {
      // JWT error
      event.cookies.delete("AuthorizationToken", { path: "/" });
      console.error(error);
      throw redirect(303, "/");
    }
  } else {
    event.locals.user = null;
  }

  let theme = event.cookies.get("theme");

  if (!theme) {
    event.cookies.set("theme", "dim", {
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 365,
    });
    theme = "dim";
  }

  if (
    requestedPath == "/" ||
    requestedPath.startsWith("/login") ||
    requestedPath == "/api/user/login"
  ) {
    // Un-auth routes here
    return await resolve(event, {
      transformPageChunk: ({ html }) => {
        return html.replace('data-theme=""', `data-theme="${theme}"`);
      },
    });
  }

  if (requestedPath.startsWith("/api")) {
    if (!event.locals.user) {
      return new Response("error");
    }
  }

  if (!event.locals.user) {
    throw redirect(303, "/");
  }

  // PROTECTED ROUTES

  // Send trough if admin
  if (event.locals.user.isAdmin) {
    return await resolve(event, {
      transformPageChunk: ({ html }) => {
        return html.replace('data-theme=""', `data-theme="${theme}"`);
      },
    });
  }

  // CONTROLLER
  if (requestedPath.includes("/controller")) {
    // Check if user has access to project management
    if (
      !event.locals.user.projectController.includes(
        event.locals.user.selectedProjectId
      )
    ) {
      throw redirect(303, "/");
    }
  }

  // ADMIN
  if (requestedPath.includes("/admin")) {
    if (!event.locals.user.isAdmin) {
      throw redirect(303, "/");
    }
  }

  return await resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace('data-theme=""', `data-theme="${theme}"`);
    },
  });
}
