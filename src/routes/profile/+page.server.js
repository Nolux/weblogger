import { db } from "$lib/db.js";

export async function load({ fetch, locals }) {
  const user = locals.user;
  return { user };
}

export const actions = {
  default: async ({ request, locals }) => {
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
};
