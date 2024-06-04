import { redirect, fail } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { db } from "$lib/db.js";
import { env } from "$env/dynamic/private";

export const actions = {
  default: async ({ request, url, params }) => {
    const formData = Object.fromEntries(await request.formData());
    const resetToken = params.resetToken;

    if (!formData.password || !resetToken) {
      return fail(400, {
        error: "Missing password or token",
      });
    }

    const { password } = formData;

    try {
      const jwtUser = jwt.verify(resetToken, env.PRIVATE_JWT_RESET_SECRET);
      console.log(jwtUser);

      const user = await db.user.update({
        where: { email: jwtUser.email },
        data: { password: await bcrypt.hash(password, 10) },
      });
    } catch {
      return fail(400, { error: "token expired" });
    }

    throw redirect(302, "/login");
  },
};
