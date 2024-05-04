import { fail, redirect } from "@sveltejs/kit";
import jwt from "jsonwebtoken";

import { createUser } from "$lib/server/user.js";
import { PRIVATE_JWT_ACCESS_SECRET } from "$env/static/private";

export const actions = {
  default: async ({ request, url }) => {
    const formData = Object.fromEntries(await request.formData());

    const token = url.searchParams.get("token");

    if (!token) {
      return fail(400, {
        error: "Missing token",
      });
    }

    let projectId;

    try {
      const decodedToken = jwt.verify(token, PRIVATE_JWT_ACCESS_SECRET);
      projectId = decodedToken.projectId;
    } catch {
      return fail(400, {
        error: "Token expired",
      });
    }

    console.log(projectId);
    // Verify that we have an email and a password

    if (!formData.email || !formData.password) {
      return fail(400, {
        error: "Missing email or password",
      });
    }

    if (!formData.firstName || !formData.lastName) {
      return fail(400, {
        error: "Missing name",
      });
    }

    const { email, password, firstName, lastName } = formData;

    // Create a new user

    const { error } = await createUser(
      email,
      password,
      firstName,
      lastName,
      projectId
    );

    // If there was an error, return an invalid response

    if (error) {
      return fail(500, {
        error,
      });
    }

    // Redirect to the login page

    throw redirect(302, "/login");
  },
};
