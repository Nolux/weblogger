import { json } from "@sveltejs/kit";
import { db } from "$lib/db.js";

export const GET = async ({ request, locals }) => {
  const jsonret = await request.json();

  return json(jsonret);
};

export const POST = async ({ request, locals }) => {
  const jsonret = await request.json();

  return json(jsonret);
};
