import { json } from "@sveltejs/kit";

export const GET = ({ url, locals }) => {
  const user = locals.user;

  return json(user);
};
