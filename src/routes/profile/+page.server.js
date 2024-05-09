import bcrypt from "bcryptjs";

import { db } from "$lib/db.js";

export async function load({ fetch, locals }) {
  const user = locals.user;
  return { user };
}

export const actions = {
  changeUser: async ({ request, locals }) => {
    const data = await request.formData();

    const userId = locals.user.id;
    const email = data.get("email");
    let firstName = data.get("firstName");
    let lastName = data.get("lastName");

    firstName = firstName.toLowerCase();
    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

    lastName = lastName.toLowerCase();
    lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        email,
        firstName,
        lastName,
        fullName: firstName + " " + lastName,
      },
    });

    console.log(userId, email, firstName, lastName);
    return;
  },
  changePassword: async ({ request, locals }) => {
    const data = await request.formData();

    const userId = locals.user.id;

    const password = data.get("password");
    const oldPassword = data.get("oldPassword");

    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user) {
      return {
        error: "No user",
      };
    }

    // Verify the password
    const passwordIsValid = await bcrypt.compare(oldPassword, user.password);

    if (!passwordIsValid) {
      return {
        error: "Old password is not valid",
      };
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { password: await bcrypt.hash(password, 10) },
    });

    return { success: "Password changed" };
  },
};
