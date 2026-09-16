import {sequence} from "@sveltejs/kit/hooks";
import * as Sentry from "@sentry/sveltekit";
import { json, redirect } from "@sveltejs/kit";
import jwt from "jsonwebtoken";

import { env } from "$env/dynamic/private";
import { dev } from "$app/environment";
import { db } from "$lib/db.js";

Sentry.init({
    dsn: "https://6ff730d0e1c9e8e48ee1103159eb5434@o4509541128601600.ingest.de.sentry.io/4511008257278032",
    tracesSampleRate: 1,
    enableLogs: true,
    sendDefaultPii: true,
    environment: dev ? "development" : "production",
})

export const handleError = Sentry.handleErrorWithSentry();

const SESSION_EXPIRED = { message: "Session expired. Please sign in again." };

// API calls need a real 401 so the client can react. Page requests get the redirect.
const endSession = (event) => {
  event.cookies.delete("AuthorizationToken", { path: "/" });

  if (event.url.pathname.startsWith("/api")) {
    const response = json(SESSION_EXPIRED, { status: 401 });
    // SvelteKit only serializes cookies onto responses it resolves, so a
    // Response returned straight out of `handle` needs the header attached here.
    response.headers.append(
      "set-cookie",
      event.cookies.serialize("AuthorizationToken", "", { path: "/", maxAge: 0 })
    );
    return response;
  }

  throw redirect(303, "/");
};

export const handle = sequence(Sentry.sentryHandle(), async function _handle({ event, resolve }) {
  const requestedPath = event.url.pathname;
  const { headers } = event.request;

  const authCookie = event.cookies.get("AuthorizationToken");

  if (authCookie) {
    // Remove Bearer prefix

    const token = authCookie.split(" ")[1];

    let jwtUser;

    try {
      jwtUser = jwt.verify(token, env.PRIVATE_JWT_ACCESS_SECRET);
    } catch (error) {
      // Expired or tampered token
      console.error(error);
      return endSession(event);
    }

    if (typeof jwtUser === "string") {
      return endSession(event);
    }

    // Deliberately outside the try: a DB failure must surface as a 500,
    // not silently delete everyone's session cookie.
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
      // Valid token, but the user is gone
      return endSession(event);
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
      return endSession(event);
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
});
