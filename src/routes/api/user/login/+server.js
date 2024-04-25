import { json, error } from "@sveltejs/kit";
import { loginUser } from "$lib/server/user.js";

export const POST = async ({ request, cookies }) => {
  console.log(cookies);
  let { email, password } = await request.json();

  email = email.toLowerCase();

  const { error, token } = await loginUser(email, password);

  // Set the cookie
  cookies.set("AuthorizationToken", `Bearer ${token}`, {
    httpOnly: true,
    path: "/",
    secure: false, // TODO: change for prod
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return json("ok");
};
