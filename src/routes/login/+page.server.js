import { loginUser } from "$lib/server/user.js";
import { redirect, fail } from "@sveltejs/kit";

export const actions = {
  default: async (event) => {
    const formData = Object.fromEntries(await event.request.formData());

    if (!formData.email || !formData.password) {
      return fail(400, {
        error: "Missing email or password",
      });
    }

    let { email, password } = formData;

    email = email.toLowerCase();

    const { error, token } = await loginUser(email, password);

    if (error) {
      return fail(401, {
        error,
      });
    }

    // Set the cookie
    event.cookies.set("AuthorizationToken", `Bearer ${token}`, {
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    throw redirect(302, "/");
  },
};
